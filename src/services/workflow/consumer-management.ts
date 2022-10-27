/**
 * Consumer Products supports the new Consumer List and Detail page
 *
 * There are some special consideration required, due to how the
 * previous Consumer detail page was implemented.
 *
 * The old detail page allowed Kong ACLs to be updated within the context
 * of the single ServiceAccess record.  So no additional ServiceAccess records
 * were created.
 *
 * So the ServiceAccess is a reasonable way of getting a unique set of Consumers,
 * it is not a reasonable way for managing them.
 *
 * getFilteredNamespaceConsumers will take a list of Filter criteria and return a
 * full list of Consumers with minimal information (name, labels, last update date)
 *
 * Filters:
 *   - product/environment
 *   - scope
 *   - role
 *   - label?
 *
 * getConsumerAccess will take a Service Access record, use the Consumer and Application
 * and then combine the Service Access with other Service Access records for that Consumer plus
 * derived data from Kong ACL to get a full list of ConsumerAccess.  Access Request would get
 * added to a particular ConsumerProdEnvAccess record for enriched detail.  Controls can be blended
 * into the ConsumerProdEnvAccess records.  (Perhaps an "Unmanaged Controls" to show controls that
 * are not for a particular ProductEnvironment)
 *
 * getConsumerProdEnvAccess will return similar data to getConsumerAccess but will go into details about
 * the Authorization that the getConsumerAccess will not do.  It will include Access Request details
 *
 * grantConsumerProdEnvAccess will create a new ServiceAccess record for the particular ProductEnvironment
 * : Will be similar to submitting an Access Request, but assume Consumer already exists and
 *   creds already communicated; so possible plugin updates and Scope/Role updates
 * : Validation: If the IdP does not have the Consumer registered, then do not allow this to happen:
 *      "Unable to find Consumer on IdP"
 * : Controls and Authorization (Scopes/Roles) will be included in request (like the "controls")
 *
 * updateConsumerProdEnvAccess will update controls and authorization details
 * : If there was an original Request then show the information for that
 *
 * revokeConsumerProdEnvAccess is only valid for acl flows and will revoke access to the Consumer
 * : For revoking access to IdP based authorization, the Consumer must be deleted
 *
 * labels:
 * - Label Groups are derived from the Label table
 * - Labels are saved as a whole (saveConsumerLabels)
 * - Labels are included in the getFilteredNamespaceConsumers and getConsumerAccess queries
 */

import {
  getAccessRequestByNamespaceServiceAccess,
  lookupConsumerPlugins,
  lookupCredentialReferenceByServiceAccess,
  lookupLabeledServiceAccessesForNamespace,
  lookupServiceAccessesByConsumer,
  lookupEnvironmentAndIssuerById,
  getConsumerLabels,
  deleteServiceAccess,
} from '../keystone';
import { lookupEnvironmentsByNS } from '../keystone/product-environment';
import { KongConsumerService } from '../kong';
import {
  ConsumerAccess,
  ConsumerLabel,
  ConsumerProdEnvAccess,
  ConsumerQueryFilter,
  ConsumerSummary,
  RequestControls,
} from './types';
import { Logger } from '../../logger';
import { strict as assert } from 'assert';
import { getEnvironmentContext } from './get-namespaces';
import { doFiltering } from './consumer-filters';
import { getConsumerAuthz, StructuredActivityService } from '.';
import {
  Activity,
  Environment,
  GatewayConsumer,
  LabelCreateInput,
  LabelUpdateInput,
  Product,
} from '../keystone/types';
import {
  KeycloakClientRegistrationService,
  KeycloakClientService,
  KeycloakUserService,
} from '../keycloak';
import {
  addConsumerLabel,
  delConsumerLabel,
  updateConsumerLabel,
} from '../keystone/labels';
import { getActivityByRefId } from '../keystone/activity';
import { syncPlugins, trimPlugin } from './consumer-plugins';
import { removeAllButKeys } from '../../batch/feed-worker';
import { KeycloakClientRolesService } from '../keycloak/client-roles';

const logger = Logger('wf.ConsumerMgmt');

export async function allConsumerGroupLabels(
  context: any,
  ns: string
): Promise<string[]> {
  logger.debug('[allConsumerGroupLabels] %s', ns);

  const accesses = await lookupLabeledServiceAccessesForNamespace(
    context,
    ns,
    undefined
  );

  const labels = await getConsumerLabels(
    context,
    ns,
    accesses.filter((acc) => acc.consumer).map((acc) => acc.consumer.id)
  );

  const result = labels
    .map((label) => label.name)
    .reduce((previousValue, label) => {
      if (!previousValue.includes(label)) {
        previousValue.push(label);
      }
      return previousValue;
    }, [])
    .sort();

  logger.debug('[allConsumerGroupLabels] %j', result);
  return result;
}

export async function allScopesAndRoles(
  context: any,
  ns: string
): Promise<{ scopes: string[]; roles: string[] }> {
  logger.debug('[allScopesAndRoles] %s', ns);

  const envs = await lookupEnvironmentsByNS(context, ns);

  const result: any = {
    scopes: [] as any[],
    roles: [] as any[],
  };

  envs
    .filter((env) => env.credentialIssuer)
    .forEach((env) => {
      result.scopes.push(...JSON.parse(env.credentialIssuer.availableScopes));
      result.roles.push(...JSON.parse(env.credentialIssuer.clientRoles));
    });

  result.scopes = [...new Set(result.scopes)];
  result.roles = [...new Set(result.roles)];
  return result;
}

export async function getFilteredNamespaceConsumers(
  context: any,
  ns: string,
  filter: ConsumerQueryFilter
): Promise<ConsumerSummary[]> {
  logger.debug('[getFilteredNamespaceConsumers] %s %j', ns, filter);

  const consumerIds = await doFiltering(context, ns, filter);

  const accesses = await lookupLabeledServiceAccessesForNamespace(
    context,
    ns,
    consumerIds
  );

  const labels = await getConsumerLabels(
    context,
    ns,
    accesses.filter((acc) => acc.consumer).map((acc) => acc.consumer.id)
  );

  return accesses
    .filter((acc) => acc.consumer)
    .map((acc) => {
      return {
        id: acc.consumer.id,
        username: acc.consumer.username,
        customId: acc.consumer.customId,
        consumerType: acc.consumerType,
        labels: labels
          .filter((l: any) => l.consumer?.id === acc.consumer.id)
          .map(
            (l: any) =>
              ({
                labelGroup: l.name,
                values: JSON.parse(l.value),
              } as ConsumerLabel)
          ),
        lastUpdated: acc.updatedAt,
      } as ConsumerSummary;
    });
}

export async function getNamespaceConsumerAccess(
  context: any,
  ns: string,
  consumerId: string
): Promise<ConsumerAccess> {
  logger.debug('[getNamespaceConsumerAccess] %s %s', ns, consumerId);

  const serviceAccesses = await lookupLabeledServiceAccessesForNamespace(
    context,
    ns,
    [consumerId],
    true
  );
  assert.strictEqual(
    serviceAccesses.length > 0,
    true,
    'Consumer not found for namespace'
  );

  const serviceAccess = serviceAccesses[0];

  const labels = await getConsumerLabels(context, ns, [
    serviceAccess.consumer.id,
  ]);

  const access: ConsumerAccess = {
    consumer: serviceAccess.consumer,
    application: serviceAccess.application,
    owner: {
      id: serviceAccess.application?.owner.id,
      name: serviceAccess.application?.owner.name,
      provider: serviceAccess.application?.owner.provider,
      providerUsername: serviceAccess.application?.owner.providerUsername,
      email: serviceAccess.application?.owner.email,
    },
    labels: labels.map(
      (l: any) =>
        ({
          labelGroup: l.name,
          values: JSON.parse(l.value),
        } as ConsumerLabel)
    ),
    prodEnvAccess: [],
  };

  access.prodEnvAccess = (
    await getConsumerProdEnvAccessList(context, ns, serviceAccess.consumer.id)
  ).prodEnvAccess;

  return access;
}

async function getConsumerProdEnvAccessList(
  context: any,
  ns: string,
  consumerId: string
): Promise<{
  consumer: GatewayConsumer;
  prodEnvAccess: ConsumerProdEnvAccess[];
}> {
  // ConsumerProdEnvAccess:
  // - get ServiceAccess records that match the consumer ID and namespace
  // - get the ACLs for the Consumer and derive the ProdEnvAccess records
  const consumer = await lookupConsumerPlugins(context, consumerId);

  const kongApi = new KongConsumerService(process.env.KONG_URL);
  const aclGroups = (
    await kongApi.getConsumerACLByNamespace(consumer.extForeignKey, ns)
  ).map((acl: any) => acl.group);

  // find the ProductEnvironments that the ACL 'group' corresponds to
  const envs = await lookupEnvironmentsByNS(context, ns);

  const other = await lookupServiceAccessesByConsumer(context, ns, consumerId);

  const batch1 = other.map((svc) => {
    return {
      productName: svc.productEnvironment.product.name,
      environment: {
        id: svc.productEnvironment.id,
        name: svc.productEnvironment.name,
        appId: svc.productEnvironment.appId,
        additionalDetailsToRequest:
          svc.productEnvironment.additionalDetailsToRequest,
        flow: svc.productEnvironment.flow,
        services: svc.productEnvironment.services,
      },
      plugins: consumer.plugins
        .filter(
          (plugin) =>
            plugin.service?.environment?.id === svc.productEnvironment.id ||
            plugin.route?.service?.environment?.id === svc.productEnvironment.id
        )
        .map((plugin) => ({
          id: plugin.id,
          name: plugin.name,
          config: trimPlugin(plugin.config),
          service: plugin.service && {
            id: plugin.service?.id,
            name: plugin.service?.name,
          },
          route: plugin.route && {
            id: plugin.route?.id,
            name: plugin.route?.name,
          },
        })),
      revocable: isRevocable(svc.productEnvironment),
      serviceAccessId: svc.id,
      authorization: null,
      request: null,
    } as ConsumerProdEnvAccess;
  });

  const batch2 = envs
    .filter((env) => aclGroups.includes(env.appId))
    .filter(
      (env) => batch1.filter((acc) => acc.environment.id === env.id).length == 0
    )
    .map((env) => {
      return {
        productName: env.product.name,
        environment: {
          id: env.id,
          name: env.name,
          appId: env.appId,
          additionalDetailsToRequest: env.additionalDetailsToRequest,
          flow: env.flow,
          services: env.services,
        },
        plugins: consumer.plugins
          .filter(
            (plugin) =>
              plugin.service?.environment?.id === env.id ||
              plugin.route?.service?.environment?.id === env.id
          )
          .map((plugin) => ({
            id: plugin.id,
            name: plugin.name,
            config: trimPlugin(plugin.config),
            service: plugin.service && {
              id: plugin.service?.id,
              name: plugin.service?.name,
            },
            route: plugin.route && {
              id: plugin.route?.id,
              name: plugin.route?.name,
            },
          })),
        revocable: isRevocable(env),
        serviceAccessId: null,
        authorization: null,
        request: null,
      } as ConsumerProdEnvAccess;
    });

  return {
    consumer,
    prodEnvAccess: batch1.concat(batch2),
  };
}

export async function getConsumerProdEnvAccess(
  context: any,
  ns: string,
  consumerId: string,
  prodEnvId: string
): Promise<ConsumerProdEnvAccess> {
  // same as getNamespaceConsumerAccess
  // but add 'authorization' and 'request' details (if applicable)
  // and add plugin config

  const consumer = await getNamespaceConsumerAccess(context, ns, consumerId);

  consumer.prodEnvAccess = consumer.prodEnvAccess.filter(
    (p) => p.environment.id === prodEnvId
  );

  assert.strictEqual(consumer.prodEnvAccess.length, 1, 'Invalid access data');

  const access = consumer.prodEnvAccess[0];

  // If Flow is client-credentials, then lookup the Scopes and Roles for the Consumer from the IdP
  if (access.environment.flow === 'client-credentials') {
    logger.debug('[getConsumerProdEnvAccess] Gather authz from IdP..');
    const envCtx = await getEnvironmentContext(
      context,
      prodEnvId,
      { product: { namespace: ns } },
      false
    );
    if (envCtx) {
      const authz = await getConsumerAuthz(envCtx, consumer.consumer.username);
      access.authorization = {
        credentialIssuer: {
          ...envCtx.prodEnv.credentialIssuer,
          ...{ environmentDetails: null },
        },
        defaultClientScopes: authz.defaultScopes,
        defaultOptionalScopes: authz.optionalScopes,
        roles: authz.clientRoles,
      };
    }
  }

  // request?: AccessRequest;
  // lookup request based on ServiceAccess record
  if (access.serviceAccessId) {
    access.request = await getAccessRequestByNamespaceServiceAccess(
      context,
      ns,
      access.serviceAccessId
    );

    const activity = await getActivityByRefId(
      context,
      `accessRequest:${access.request.id}`
    );
    logger.debug('Activity %j', activity);

    const match: Activity[] = activity.filter(
      (a: Activity) => a.action === 'rejected' || a.action === 'approved'
    );
    if (match.length > 0) {
      const context = JSON.parse(match[0].context);
      access.requestApprover = {
        id: '',
        name: context.params.actor,
      };
    }
  }

  return access;
}

/**
 * Granting is only applicable to ACL
 * ?? What about plugins?
 *
 * @param context
 * @param ns
 * @param consumerId
 * @param prodEnvId
 */
export async function grantAccessToConsumer(
  context: any,
  ns: string,
  consumerId: string,
  prodEnvId: string,
  { plugins }: RequestControls
): Promise<void> {
  // make sure the consumer hasn't granted access already
  const { consumer, prodEnvAccess } = await getConsumerProdEnvAccessList(
    context,
    ns,
    consumerId
  );

  logger.debug('[grantAccessToConsumer] Consumer %j', consumer);

  const prodEnv = await lookupEnvironmentAndIssuerById(context, prodEnvId);

  assert.strictEqual(
    isRevocable(prodEnv),
    true,
    `Flow ${prodEnv.flow} can not be granted to consumer`
  );

  const kongApi = new KongConsumerService(process.env.KONG_URL);
  await kongApi.assignConsumerACL(consumer.extForeignKey, ns, prodEnv.appId);

  await new StructuredActivityService(context, ns).logGrantRevokeConsumerAccess(
    true,
    true,
    {
      environment: prodEnv,
      product: prodEnv.product,
      consumer: consumer,
    }
  );

  if (plugins) {
    await syncPlugins(context, ns, consumer, prodEnv, plugins);
  }
}

/**
 * Revoking is only applicable to ACL
 * ?? What about plugins?
 *
 * @param context
 * @param ns
 * @param consumerId
 * @param prodEnvId
 */
export async function revokeAccessFromConsumer(
  context: any,
  ns: string,
  consumerId: string,
  prodEnvId: string
): Promise<void> {
  // make sure the consumer has granted access already
  const { consumer, prodEnvAccess } = await getConsumerProdEnvAccessList(
    context,
    ns,
    consumerId
  );

  const prodEnvAccessFiltered = prodEnvAccess.filter(
    (p) => p.environment.id === prodEnvId
  );

  assert.strictEqual(
    prodEnvAccessFiltered.length === 1,
    true,
    'Consumer is not granted to this product environment.'
  );

  const prodEnvAccessItem = prodEnvAccessFiltered[0];

  assert.strictEqual(prodEnvAccessItem.revocable, true, 'Access not revocable');

  const serviceAccessId = prodEnvAccessItem.serviceAccessId;

  const prodEnv = await lookupEnvironmentAndIssuerById(context, prodEnvId);

  assert.strictEqual(
    isRevocable(prodEnv),
    true,
    `Flow ${prodEnv.flow} can not be revoked from consumer`
  );

  logger.warn('[revokeAccessFromConsumer] Service Access %s', serviceAccessId);

  const kongApi = new KongConsumerService(process.env.KONG_URL);
  await kongApi.removeConsumerACL(consumer.extForeignKey, ns, prodEnv.appId);

  await new StructuredActivityService(context, ns).logGrantRevokeConsumerAccess(
    true,
    false,
    {
      environment: prodEnv,
      product: prodEnv.product,
      consumer,
    }
  );

  await syncPlugins(context, ns, consumer, prodEnv, []);
}

/**
 * Updating is about authorization
 *
 * @param context
 * @param ns
 * @param consumerId
 * @param prodEnvId
 * @param controls
 */
export async function updateConsumerAccess(
  context: any,
  ns: string,
  consumerId: string,
  prodEnvId: string,
  { plugins, defaultClientScopes, roles }: RequestControls
): Promise<void> {
  // make sure the consumer has granted access already
  const { consumer, prodEnvAccess } = await getConsumerProdEnvAccessList(
    context,
    ns,
    consumerId
  );

  const prodEnvAccessFilter = prodEnvAccess.filter(
    (p) => p.environment.id === prodEnvId
  );

  assert.strictEqual(
    prodEnvAccessFilter.length,
    1,
    'Consumer is not granted to this product environment.'
  );

  const prodEnvAccessItem = prodEnvAccessFilter[0];

  const changeList: string[] = [];

  if (prodEnvAccessItem.environment.flow === 'client-credentials') {
    const envCtx = await getEnvironmentContext(
      context,
      prodEnvId,
      { product: { namespace: ns } },
      false
    );

    const kcClientService = new KeycloakClientService(
      envCtx.issuerEnvConfig.issuerUrl
    );
    const kcClientRegService = new KeycloakClientRegistrationService(
      envCtx.issuerEnvConfig.issuerUrl,
      envCtx.openid.registration_endpoint
    );
    await kcClientService.login(
      envCtx.issuerEnvConfig.clientId,
      envCtx.issuerEnvConfig.clientSecret
    );
    await kcClientRegService.login(
      envCtx.issuerEnvConfig.clientId,
      envCtx.issuerEnvConfig.clientSecret
    );

    // Will raise error if not found
    await kcClientService.findByClientId(consumer.username);

    if (defaultClientScopes) {
      const allScopes = await kcClientService.findRealmClientScopes();

      const selectedScopes = allScopes.filter((s: any) =>
        defaultClientScopes.includes(s.name)
      );

      assert.strictEqual(
        selectedScopes.length,
        defaultClientScopes.length,
        'Scope missing from IdP'
      );

      logger.debug('[updateConsumerProdEnvAccess] selected %j', selectedScopes);

      const consumerUsername = consumer.username;

      const isClient = await kcClientService.isClient(consumerUsername);

      assert.strictEqual(
        isClient,
        true,
        'Only clients (not users) support scopes'
      );

      const clientScopes = selectedScopes.map((scope) => scope.name);
      if (roles) {
        clientScopes.push('roles');
      }

      const changes = await kcClientRegService.syncAndApply(
        consumer.username,
        clientScopes,
        [] as string[]
      );
      changeList.push(...changes);
    }

    if (roles) {
      const clientRolesService = new KeycloakClientRolesService(
        envCtx.issuerEnvConfig.issuerUrl
      );
      await clientRolesService.login(
        envCtx.issuerEnvConfig.clientId,
        envCtx.issuerEnvConfig.clientSecret
      );

      const changes = await clientRolesService.syncRoles(
        envCtx.issuerEnvConfig.clientId,
        roles,
        consumer.username
      );
      changeList.push(...changes);
    }

    if (changeList.length > 0) {
      logger.info('[%s] %j', consumer.username, changeList);

      const accessUpdates = [];
      defaultClientScopes &&
        accessUpdates.push(`Scopes:${defaultClientScopes?.join(', ')}`);
      roles && accessUpdates.push(`Roles:${roles?.join(', ')}`);
      const accessUpdate = accessUpdates.join(', ');

      await new StructuredActivityService(context, ns).logUpdateConsumerAccess(
        true,
        {
          prodEnvAccessItem,
          environment: prodEnvAccessItem.environment,
          productName: prodEnvAccessItem.productName,
          consumer,
        },
        accessUpdate
      );
    }
  }

  if (plugins) {
    await syncPlugins(
      context,
      ns,
      consumer,
      {
        name: prodEnvAccessItem.environment.name,
        product: { name: prodEnvAccessItem.productName },
      } as Environment,
      plugins
    );
  }
}

/**
 * Revoke all Consumer Access will delete the Service Access
 * records associated with the consumerId
 * and cascade handling of the client on the IdP (if applicable)
 *
 * @param context
 * @param ns
 * @param consumerId
 */
export async function revokeAllConsumerAccess(
  context: any,
  ns: string,
  consumerId: string
): Promise<void> {
  logger.info('[revokeAllConsumerAccess] Delete %s : %s', ns, consumerId);

  const { consumer, prodEnvAccess } = await getConsumerProdEnvAccessList(
    context,
    ns,
    consumerId
  );

  logger.warn(
    '[revokeAllConsumerAccess] %s',
    JSON.stringify(prodEnvAccess, null, 3)
  );
  assert.strictEqual(
    prodEnvAccess.length == 1 && prodEnvAccess[0].serviceAccessId != null,
    true,
    'Not eligible for deletion'
  );

  const serviceAccessId = prodEnvAccess[0].serviceAccessId;
  await deleteServiceAccess(context, serviceAccessId);

  await new StructuredActivityService(context, ns).logRevokeAllConsumerAccess(
    true,
    {
      consumer,
    }
  );
}

/**
 * Is this at the Application or Consumer level?
 * Application can have 0-N Consumers (Credentials) associated with it
 * (Separate ServiceAccess records get created)
 * Could want to assign Labels to Users though
 *
 * @param context
 * @param consumerId
 * @param labels
 */
export async function saveConsumerLabels(
  context: any,
  ns: string,
  consumerId: string,
  labels: ConsumerLabel[]
): Promise<void> {
  const changes = { A: 0, D: 0, U: 0 };

  // make sure consumer is valid
  await lookupConsumerPlugins(context, consumerId);

  const currentLabels = await getConsumerLabels(context, ns, [consumerId]);

  logger.debug('[saveConsumerLabels] New=%j Cur=%j', labels, currentLabels);

  // Do all the Additions
  const addPromises = labels
    .filter((l) => l.values.length != 0)
    .filter(
      (l) => currentLabels.filter((c) => c.name === l.labelGroup).length === 0
    )
    .map(async (l) => {
      const label: LabelCreateInput = {
        name: l.labelGroup,
        value: JSON.stringify(l.values),
        namespace: ns,
        consumer: { connect: { id: consumerId } },
      };

      await addConsumerLabel(context, label);
      changes.A++;
    });
  await Promise.all(addPromises);

  // Do all the Deletions
  const delPromises = currentLabels
    .filter(
      (l) =>
        labels
          .filter((c) => c.values.length != 0)
          .filter((c) => c.labelGroup === l.name).length === 0
    )
    .map(async (l) => {
      await delConsumerLabel(context, l.id);
      changes.D++;
    });
  await Promise.all(delPromises);

  // Do any edits
  const editPromises = currentLabels
    .filter(
      (l) =>
        labels
          .filter((c) => c.values.length != 0)
          .filter((c) => c.labelGroup === l.name).length === 1
    )
    .map((l) => {
      const newLabel = labels.filter((c) => c.labelGroup === l.name).pop();
      return {
        id: l.id,
        name: l.name,
        oldValue: l.value,
        newValue: JSON.stringify(newLabel.values),
      };
    })
    .filter((l) => l.newValue != l.oldValue)
    .map(async (l) => {
      const label: LabelUpdateInput = {
        name: l.name,
        value: l.newValue,
      };

      await updateConsumerLabel(context, l.id, label);
      changes.U++;
    });
  await Promise.all(editPromises);

  logger.debug('[saveConsumerLabels] Changes %j', changes);
}

/**
 *
 * @param prodEnv
 * @returns boolean
 */
function isRevocable(prodEnv: Environment): boolean {
  return ['kong-api-key-acl', 'kong-acl-only'].includes(prodEnv.flow);
}
