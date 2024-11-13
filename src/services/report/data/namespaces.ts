import {
  transformSingleValueAttributes,
  camelCaseAttributes,
  dedup,
} from '../../utils';
import { KeycloakGroupService } from '../../keycloak';
import { getMyNamespaces } from '../../workflow';
import {
  EnvironmentContext,
  NamespaceSummary,
} from '../../workflow/get-namespaces';
import { GWAService } from '../../gwaapi';
import { ReportOfGatewayMetrics } from './gateway-metrics';
import { ReportOfProducts } from './products';
import { ReportOfConsumerRequest } from './consumer-requests';
import { lookupUsersByNamespace } from '@/services/keystone';

export interface ReportOfNamespaces {
  resource_id: string;
  name: string;
  displayName?: string;
  permProtectedNs?: string;
  permDomains?: string[];
  permDataPlane?: string;
  org?: string;
  orgUnit?: string;
  decommissioned?: string;
  consumers?: number;
  day_30_total?: number;
  features?: { [feature: string]: string };
}

/*
  Get Namespaces
 */
export async function getNamespaces(
  envCtx: EnvironmentContext
): Promise<ReportOfNamespaces[]> {
  const nsList: NamespaceSummary[] = await getMyNamespaces(envCtx);

  const kcGroupService = new KeycloakGroupService(
    envCtx.issuerEnvConfig.issuerUrl
  );
  await kcGroupService.login(
    envCtx.issuerEnvConfig.clientId,
    envCtx.issuerEnvConfig.clientSecret
  );

  const client = new GWAService(process.env.GWA_API_URL);
  const defaultSettings = await client.getDefaultNamespaceSettings();

  const dataPromises = nsList.map(
    async (ns): Promise<ReportOfNamespaces> => {
      const detail: ReportOfNamespaces = {
        resource_id: ns.id,
        name: ns.name,
        displayName: ns.displayName,
      };
      const nsPermissions = await kcGroupService.getGroup('ns', ns.name);

      transformSingleValueAttributes(nsPermissions.attributes, [
        'perm-data-plane',
        'perm-protected-ns',
        'org',
        'org-unit',
        'decommissioned',
      ]);
      const merged = {
        ...detail,
        ...defaultSettings,
        ...nsPermissions.attributes,
      };
      camelCaseAttributes(merged, [
        'perm-domains',
        'perm-data-plane',
        'perm-protected-ns',
        'org',
        'org-unit',
        'decommissioned',
      ]);
      return merged;
    }
  );

  return Promise.all(dataPromises);
}

export function rollupFeatures(
  namespaces: ReportOfNamespaces[],
  gatewayMetrics: ReportOfGatewayMetrics[],
  products: ReportOfProducts[]
) {
  namespaces.forEach((ns) => {
    ns.features = {};
    ns.day_30_total = 0;
    gatewayMetrics
      .filter((gw) => gw.namespace == ns.name)
      .forEach((gw) => {
        gw.features.forEach((feat) => (ns.features[feat] = 'Y'));
        ns.day_30_total = ns.day_30_total + gw.day_30_total;
      });
    products
      .filter((gw) => gw.namespace == ns.name)
      .forEach((gw) => {
        gw.features.forEach((feat) => (ns.features[feat] = 'Y'));
      });
  });
}

export function rollupConsumers(
  namespaces: ReportOfNamespaces[],
  requests: ReportOfConsumerRequest[]
) {
  namespaces.forEach((ns) => {
    ns.consumers = requests.filter(
      (req) => req.namespace === ns.name && req.req_result === 'Approved'
    ).length;
  });
}
