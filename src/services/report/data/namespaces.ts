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
  features?: string[];
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
    ns.features = [];
    gatewayMetrics
      .filter((gw) => gw.namespace == ns.name)
      .forEach((gw) => {
        ns.features.push.apply(ns.features, gw.features);
      });
    products
      .filter((gw) => gw.namespace == ns.name)
      .forEach((gw) => {
        ns.features.push.apply(ns.features, gw.features);
      });

    ns.features = dedup(ns.features).sort();
  });
}
