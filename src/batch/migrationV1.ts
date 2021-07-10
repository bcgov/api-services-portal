const keystoneApi = require('../services/keystone');

import { AssertionError } from 'assert';

import { doClientLoginForCredentialIssuer } from '../lists/extensions/Common';
import type { TokenExchangeResult } from '../lists/extensions/Common';
import {
  KeycloakPermissionTicketService,
  KeycloakUserService,
} from '../services/keycloak';
import {
  UMAResourceRegistrationService,
  ResourceSetQuery,
  ResourceSetInput,
} from '../services/uma2';
import { CreateServiceAccount } from '../services/workflow';

import { Logger } from '../logger';
import { ServiceAccess } from '@/services/keystone/types';

export interface V1ServiceAccount {
  clientId: string;
  enabled: string;
}

export interface V1Attributes {
  'perm-domains': string[];
  'perm-protected-ns': string[];
}

export interface V1Definition {
  namespace: string;
  service_accounts: V1ServiceAccount[];
  admin_membership: V1Membership[];
  view_membership: V1Membership[];
  attributes: V1Attributes;
  acl_protected: V1ServiceACL[];
  acl_members: string[]; // consumer usernames
}

export interface V1Membership {
  id: string;
  username: string;
}

export interface V1ServiceACL {
  acl_allow: string[];
  name: string;
}

const logger = Logger('migration.v1');

export class MigrationFromV1 {
  private keystone: any;

  constructor(keystone: any) {
    this.keystone = keystone;
  }

  /* Go through the V1Definition, and determine what needs migrating
   * and perform the migration for each.
   */
  public async migrate(definition: V1Definition[]) {
    // 1. Namespace - check that it exists as a Resource, if not:
    //    - create it
    //    - update attributes
    //    - membership : create UMA Permission Tickets for each member
    // 2. Service Accounts - check that a Consumer exists for it, if not, create Consumer, and ServiceAccess
    // 3. ACL Protected - create a ServiceAccess record for each Consumer

    const noauthContext = this.keystone.createContext({
      skipAccessControl: true,
    });
    const productEnvironmentSlug = process.env.GWA_PROD_ENV_SLUG;
    const prodEnv = await keystoneApi.lookupProductEnvironmentServicesBySlug(
      noauthContext,
      productEnvironmentSlug
    );
    const tokenResult: TokenExchangeResult = await doClientLoginForCredentialIssuer(
      noauthContext,
      prodEnv.id
    );

    const kcprotectApi = new UMAResourceRegistrationService(
      tokenResult.issuer,
      tokenResult.accessToken
    );
    const resOwnerResourceIds = await kcprotectApi.listResources({
      owner: tokenResult.clientUuid,
      type: prodEnv.credentialIssuer.resourceType,
    } as ResourceSetQuery);

    const resOwnerResources = await kcprotectApi.listResourcesByIdList(
      resOwnerResourceIds
    );

    const kcpermApi = new KeycloakPermissionTicketService(
      tokenResult.issuer,
      tokenResult.accessToken
    );

    const resourceScopes = JSON.parse(prodEnv.credentialIssuer.resourceScopes);

    logger.info('Resource Scopes %j', resourceScopes);

    return Promise.all(
      definition.map(async (def: V1Definition) => {
        const found = resOwnerResources.filter(
          (res: any) => res.name == def.namespace
        );
        logger.info(
          '---- %s %s',
          def.namespace,
          found.length == 1 ? 'EXISTS' : 'NEW'
        );

        const workingResource: { id: string } = { id: null };
        if (found.length == 0) {
          const resource: ResourceSetInput = {
            name: def.namespace,
            type: 'namespace',
            resource_scopes: resourceScopes,
            ownerManagedAccess: true,
          };
          const newresource = await kcprotectApi.createResourceSet(resource);
          logger.info(' > Created %j', newresource);
          workingResource['id'] = newresource['id'];
        } else {
          workingResource['id'] = found[0]['id'];
        }

        const existingAccounts = await keystoneApi.lookupServiceAccessesByNamespace(
          noauthContext,
          def.namespace
        );
        const isExistingAccount = (nm: string) =>
          existingAccounts.filter((sa: any) => sa.consumer.username === nm)
            .length != 0;

        for (const svc of def.service_accounts) {
          if (isExistingAccount(svc.clientId)) {
            logger.info(' > Skipped [%s] Service Account', svc.clientId);
          } else {
            const result = await CreateServiceAccount(
              noauthContext,
              productEnvironmentSlug,
              def.namespace,
              workingResource['id'],
              ['GatewayConfig.Publish'],
              svc.clientId
            );
            logger.info(
              ' > Created [%s] Service Account %j',
              svc.clientId,
              result
            );
          }
        }

        for (const user of def.admin_membership) {
          const granted = true;
          logger.info(' > Update permissions with Namespace.Manage %j', user);

          for (const scope of ['Namespace.Manage']) {
            const permission = await kcpermApi.createOrUpdatePermission(
              workingResource.id,
              user.id,
              granted,
              scope
            );
            logger.info(' > Permission %j', user, permission);
          }
        }

        // Get a list of all Service Accesses by Namespace
        const serviceAccesses = await keystoneApi.lookupServiceAccessesByNamespace(
          noauthContext,
          def.namespace
        );

        const isServiceAccessExists = (username: string) =>
          serviceAccesses.filter(
            (sa: ServiceAccess) => sa.consumer.username === username
          ).length != 0;

        // If the Consumer Username does not exist, then
        // create a Service Access record
        for (const consumer of def.acl_members.filter(
          (consumer) => !isServiceAccessExists(consumer)
        )) {
          logger.info(' > Create Service Access for %j', consumer);
          const consumerItem = await keystoneApi
            .lookupKongConsumerByUsername(noauthContext, consumer)
            .catch((ex: any) => {
              if (ex instanceof AssertionError) {
                logger.warn('[%s] %s', consumer, ex);
              } else {
                throw ex;
              }
            });

          if (consumerItem) {
            await keystoneApi.addServiceAccess(
              noauthContext,
              consumer + ' for namespace ' + def.namespace,
              true,
              true,
              consumer.includes('@') ? 'user' : 'client',
              null,
              null,
              consumerItem.id,
              null,
              null,
              def.namespace
            );
          }
        }

        // } else {
        //   logger.info('---- Skipping');
        //   // const cleanupServiceAccounts = await keystoneApi.deleteRecords (noauthContext, 'ServiceAccess', {namespace: def.namespace}, true, ['id'])
        //   // logger.info(" > Deleted Service Accounts %j", cleanupServiceAccounts)
        //   // await kcprotectApi.deleteResourceSet(found[0].id)
        //   // logger.info(" > Deleted")
        // }
      })
    );
  }

  public async report(definitions: V1Definition[]) {
    for (const def of definitions) {
      if (def.acl_protected.length > 0) {
        logger.info('[%s]', def.namespace);
        for (const acl of def.acl_protected) {
          logger.info(' --> %s : %j', acl.name, acl.acl_allow);
        }
      }
    }
  }

  /*
   * Use the /push API to pre-configure Products and Environments; these
   * will be used to create ServiceAccess records for each Consumer that
   * has access to a service within a particular Namespace.
   * Use the V1Definition to determine which services are protected with
   * an ACL, and create the pre-configured data for Products and Environments
   * under the appropriate namespace.
   *
   * Then loop through the V1ServiceACL:
   * - lookup the username in Consumers (they should exist) (keystoneapi)
   * - lookup the Product Environment based on the Service Name (keystoneapi)
   * - create a ServiceAccess record if one doesn't already exist (keystoneapi addServiceRequest)
   */
  public async migrateACL(definitions: V1Definition[]) {
    //const serviceAccessId = await addServiceAccess(context, clientId, false, aclEnabled, consumerType, credentialReference, null, newApiKey.consumerPK, productEnvironment, application )
  }
}
