import {
  getResourceSets,
  isUserBasedResourceOwners,
} from '../../lists/extensions/Common';
import { Logger } from '../../logger';
import { newNamespaceID } from '../identifiers';
import {
  generateDisplayName,
  validateDisplayName,
  validateNamespaceName,
} from '../keycloak/namespace-details';
import {
  lookupProductEnvironmentServicesBySlug,
  recordActivity,
} from '../keystone';
import { NamespaceService } from '../org-groups';
import { getEnvironmentContext } from './get-namespaces';
import { ResourceSetInput, UMAResourceRegistrationService } from '../uma2';
import {
  KeycloakGroupService,
  KeycloakPermissionTicketService,
} from '../keycloak';

const logger = Logger('wf.CreateNamespace');

export interface CreateNamespaceArgs {
  name?: string;
  org?: string;
  orgUnit?: string;
  orgEnabled?: boolean;
  displayName?: string;
  dataPlane?: string;
  domains?: string[];
}

export async function CreateNamespace(
  context: any,
  args: CreateNamespaceArgs
): Promise<any> {
  const newNS = args.name ? args.name : newNamespaceID();

  validateNamespaceName(newNS);

  const displayName = args.displayName || generateDisplayName(context, newNS);

  validateDisplayName(displayName);

  const noauthContext = context.createContext({
    skipAccessControl: true,
  });
  const prodEnv = await lookupProductEnvironmentServicesBySlug(
    noauthContext,
    process.env.GWA_PROD_ENV_SLUG
  );
  const envCtx = await getEnvironmentContext(context, prodEnv.id, {}, true);

  const nsService = new NamespaceService(envCtx.issuerEnvConfig.issuerUrl);
  await nsService.login(
    envCtx.issuerEnvConfig.clientId,
    envCtx.issuerEnvConfig.clientSecret
  );
  await nsService.checkNamespaceAvailable(newNS);

  // This function gets all resources but also sets the accessToken in envCtx
  // which we need to create the resource set
  await getResourceSets(envCtx);

  const resourceApi = new UMAResourceRegistrationService(
    envCtx.uma2.resource_registration_endpoint,
    envCtx.accessToken
  );

  const scopes: string[] = [
    'Namespace.Manage',
    'Namespace.View',
    'GatewayConfig.Publish',
    'Access.Manage',
    'Content.Publish',
    'CredentialIssuer.Admin',
  ];
  const res = <ResourceSetInput>{
    name: newNS,
    displayName,
    type: 'namespace',
    resource_scopes: scopes,
    ownerManagedAccess: true,
  };

  const rset = await resourceApi.createResourceSet(res);

  if (isUserBasedResourceOwners(envCtx) == false) {
    const permissionApi = new KeycloakPermissionTicketService(
      envCtx.issuerEnvConfig.issuerUrl,
      envCtx.accessToken
    );
    for (const scope of [
      'Namespace.Manage',
      'CredentialIssuer.Admin',
      'GatewayConfig.Publish',
      'Access.Manage',
    ]) {
      await permissionApi.createPermission(
        rset.id,
        envCtx.subjectUuid,
        true,
        scope
      );
    }
  }

  const kcGroupService = new KeycloakGroupService(
    envCtx.issuerEnvConfig.issuerUrl
  );
  await kcGroupService.login(
    envCtx.issuerEnvConfig.clientId,
    envCtx.issuerEnvConfig.clientSecret
  );

  const { id, created } = await kcGroupService.createIfMissing('ns', newNS);

  if (created) {
    const gwGroup = await kcGroupService.getGroupById(id);
    if (args.org) {
      gwGroup.attributes['org'] = [args.org];
    }
    if (args.orgUnit) {
      gwGroup.attributes['org-unit'] = [args.orgUnit];
    }
    if (args.orgEnabled) {
      gwGroup.attributes['org-enabled'] = [`${args.orgEnabled}`];
    }
    if (args.dataPlane) {
      gwGroup.attributes['perm-data-plane'] = [args.dataPlane];
    }
    if (args.domains) {
      gwGroup.attributes['perm-domains'] = args.domains;
    }
    await kcGroupService.updateGroup(gwGroup);
  }

  await recordActivity(
    context.sudo(),
    'create',
    'Namespace',
    newNS,
    `Created ${newNS} namespace`,
    'success',
    JSON.stringify({
      message: '{actor} created {ns} namespace',
      params: {
        actor: context.authedItem.name,
        ns: newNS,
      },
    }),
    newNS,
    [`Namespace:${newNS}`, `actor:${context.authedItem.name}`]
  );

  return rset;
}
