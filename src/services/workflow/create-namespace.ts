import { strict as assert } from 'assert';
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
import {
  ResourceSet,
  ResourceSetInput,
  UMAResourceRegistrationService,
} from '../uma2';
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
  runtimeGroupName?: string;
  routePaths?: string[];
  assignedScopes?: string[];
  includeSDXScopes?: boolean;
}

export async function CreateNamespace(
  context: any,
  args: CreateNamespaceArgs
): Promise<ResourceSet> {
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
  // ERR-014: registration is now an idempotent reconcile, not create-only.
  // checkNamespaceAvailable's unconditional throw meant repeating an
  // otherwise-identical registration (or retrying after a partial
  // failure) always 422'd with "Namespace already exists" and there was
  // no supported way to update perm-domains/perm-route-paths/etc. on an
  // existing namespace.
  const nsAlreadyExists = await nsService.namespaceExists(newNS);

  // This function gets all resources but also sets the accessToken in envCtx
  // which we need to create the resource set
  await getResourceSets(envCtx);

  const resourceApi = new UMAResourceRegistrationService(
    envCtx.uma2.resource_registration_endpoint,
    envCtx.accessToken
  );

  let rset: ResourceSet;

  if (nsAlreadyExists) {
    // The UMA resource set and its permission tickets identify the
    // namespace itself and aren't recreated on reconcile - only the
    // mutable Keycloak group attributes (below) are brought in line with
    // the requested args.
    rset = await resourceApi.findResourceByName(newNS);
    assert.strictEqual(
      rset !== undefined,
      true,
      `Namespace '${newNS}' has a Keycloak group but no matching UMA resource - manual repair required`
    );
  } else {
    const scopes: string[] = [
      'Namespace.Manage',
      'Namespace.View',
      'GatewayConfig.Publish',
      'Access.Manage',
      'Content.Publish',
      'CredentialIssuer.Admin',
    ];
    if (args.includeSDXScopes) {
      scopes.push('Connection.Manage');
      scopes.push('GatewayPattern.Publish');
    }
    const res = <ResourceSetInput>{
      name: newNS,
      displayName,
      type: 'namespace',
      resource_scopes: scopes,
      ownerManagedAccess: true,
    };

    rset = await resourceApi.createResourceSet(res);

    if (isUserBasedResourceOwners(envCtx) == false) {
      const permissionApi = new KeycloakPermissionTicketService(
        envCtx.issuerEnvConfig.issuerUrl,
        envCtx.accessToken
      );
      for (const scope of args.assignedScopes || [
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
  }

  const kcGroupService = new KeycloakGroupService(
    envCtx.issuerEnvConfig.issuerUrl
  );
  await kcGroupService.login(
    envCtx.issuerEnvConfig.clientId,
    envCtx.issuerEnvConfig.clientSecret
  );

  const { id } = await kcGroupService.createIfMissing('ns', newNS);

  // Reconcile attributes whether the group was just created or already
  // existed - previously this was gated on `created`, so re-registering
  // an existing namespace with updated domains/route-paths silently kept
  // the stale values.
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
  if (args.runtimeGroupName) {
    gwGroup.attributes['perm-runtime-group'] = [args.runtimeGroupName];
  }
  if (args.routePaths) {
    gwGroup.attributes['perm-route-paths'] = args.routePaths;
  }
  await kcGroupService.updateGroup(gwGroup);

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
