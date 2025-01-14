import {
  camelCaseAttributes,
  regExprValidation,
  transformSingleValueAttributes,
} from '../utils';
import { IssuerEnvironmentConfig } from '../workflow/types';
import { KeycloakGroupService } from './group-service';

import { Logger } from '../../logger';
import { Keystone } from '@keystonejs/keystone';
import { getOrganizationUnit } from '../keystone';
import { ResourceSet, UMAResourceRegistrationService } from '../uma2';
import {
  EnvironmentContext,
  getNamespaceResourceSets,
  getOrgPoliciesForResource,
} from '../../lists/extensions/Common';
import { GWAService } from '../gwaapi';
import { strict as assert } from 'assert';

const logger = Logger('kc.nsdetails');

export async function getAllNamespaces(envCtx: EnvironmentContext) {
  const resourceIds = await getNamespaceResourceSets(envCtx);
  const resourcesApi = new UMAResourceRegistrationService(
    envCtx.uma2.resource_registration_endpoint,
    envCtx.accessToken
  );
  const namespaces = await resourcesApi.listResourcesByIdList(resourceIds);

  const nsList = namespaces.map((ns: ResourceSet) => ({
    id: ns.id,
    name: ns.name,
    displayName: ns.displayName || `Gateway ${ns.name}`,
    scopes: ns.resource_scopes,
    prodEnvId: envCtx.prodEnv.id,
  }));

  const kcGroupService = await getKeycloakGroupApi(envCtx.issuerEnvConfig);

  const client = new GWAService(process.env.GWA_API_URL);
  const defaultSettings = await client.getDefaultNamespaceSettings();

  return (
    await Promise.all(
      nsList.map(async (nsdata: any) => {
        return backfillGroupAttributes(
          nsdata.name,
          nsdata,
          defaultSettings,
          kcGroupService
        );
      })
    ).catch((err: any) => {
      throw err;
    })
  ).filter((x) => Boolean(x));
}

export async function getKeycloakGroupApi(
  issuerEnvConfig: IssuerEnvironmentConfig
): Promise<KeycloakGroupService> {
  const kcGroupService = new KeycloakGroupService(issuerEnvConfig.issuerUrl);
  await kcGroupService.login(
    issuerEnvConfig.clientId,
    issuerEnvConfig.clientSecret
  );
  await kcGroupService.cacheGroups();
  return kcGroupService;
}

export async function backfillGroupAttributes(
  ns: string,
  detail: any,
  defaultSettings: any,
  kcGroupService: KeycloakGroupService
): Promise<any> {
  const nsPermissions = await kcGroupService.getGroup('ns', ns);

  assert.strictEqual(Boolean(nsPermissions), true, 'Invalid namespace');

  transformSingleValueAttributes(nsPermissions.attributes, [
    'description',
    'perm-data-plane',
    'perm-protected-ns',
    'org',
    'org-unit',
    'org-enabled',
    'org-notice-viewed',
    'org-updated-at',
  ]);

  logger.debug(
    '[backfillGroupAttributes] %s attributes %j',
    ns,
    nsPermissions.attributes
  );

  const merged = {
    ...detail,
    ...defaultSettings,
    ...{ 'org-enabled': false },
    ...nsPermissions.attributes,
    ...{
      'org-enabled':
        'org-enabled' in nsPermissions.attributes &&
        nsPermissions.attributes['org-enabled'] === 'true'
          ? true
          : false,
      'org-notice-viewed':
        'org-notice-viewed' in nsPermissions.attributes &&
        nsPermissions.attributes['org-notice-viewed'] === 'true',
      'org-admins': null,
    },
  };

  camelCaseAttributes(merged, [
    'perm-domains',
    'perm-data-plane',
    'perm-protected-ns',
    'org',
    'org-unit',
    'org-updated-at',
    'org-enabled',
    'org-notice-viewed',
    'org-admins',
  ]);

  return merged;
}

export async function transformOrgAndOrgUnit(
  context: Keystone,
  envCtx: EnvironmentContext,
  merged: any,
  getOrgAdmins: boolean
): Promise<void> {
  const orgInfo = await getOrganizationUnit(context, merged.orgUnit);
  if (orgInfo) {
    merged['org'] = { name: orgInfo.name, title: orgInfo.title };
    merged['orgUnit'] = {
      name: orgInfo.orgUnits[0].name,
      title: orgInfo.orgUnits[0].title,
    };
  } else {
    merged['org'] = { name: merged.org, title: merged.org };
    merged['orgUnit'] = { name: merged.orgUnit, title: merged.orgUnit };
  }

  // lookup org admins from
  if (getOrgAdmins && merged.id) {
    const orgPolicies = await getOrgPoliciesForResource(envCtx, merged.id);
    const orgAdmins: string[] = [];
    orgPolicies.map((policy) => {
      orgAdmins.push(...policy.users);
    });
    merged['orgAdmins'] = [...new Set(orgAdmins)];
  }
}

export async function getResource(
  selectedNS: string,
  envCtx: EnvironmentContext
) {
  const resourceIds = await getNamespaceResourceSets(envCtx);
  const resourcesApi = new UMAResourceRegistrationService(
    envCtx.uma2.resource_registration_endpoint,
    envCtx.accessToken
  );
  const namespaces = await resourcesApi.listResourcesByIdList(resourceIds);

  return namespaces
    .filter((ns) => ns.name === selectedNS)
    .map((ns: ResourceSet) => ({
      id: ns.id,
      name: ns.name,
      displayName: ns.displayName || `Gateway ${ns.name}`,
      scopes: ns.resource_scopes,
    }))
    .pop();
}

export function generateDisplayName(context: any, gatewayId: string): string {
  logger.debug('[generateDisplayName] %j', context.req?.user);
  if (context.req?.user?.provider_username) {
    return `${context.req?.user?.provider_username}'s Gateway`;
  } else {
    return null;
  }
}

export function validateNamespaceName(name: string) {
  const namespaceValidationRule = '^[a-z][a-z0-9-]{3,13}[a-z0-9]$';

  regExprValidation(
    namespaceValidationRule,
    name,
    'Gateway ID must be between 5 and 15 lowercase alpha-numeric characters and start and end with a letter.'
  );
}

export function validateDisplayName(displayName: string) {
  const displayNameValidationRule = "^[A-Za-z0-9][A-Za-z0-9-()_ .'\\/]{2,29}$";

  regExprValidation(
    displayNameValidationRule,
    displayName,
    'Display name must be between 3 and 30 characters, starting with an alpha-numeric character, and can only use special characters "-()_ .\'/".'
  );
}
