import { camelCaseAttributes, transformSingleValueAttributes } from '../utils';
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
      displayName: ns.displayName,
      scopes: ns.resource_scopes,
    }))
    .pop();
}
