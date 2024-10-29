import { lookupServicesByNamespaceForReporting } from '../../keystone/gateway-service';
import { Keystone } from '@keystonejs/keystone';
import { ReportOfNamespaces } from './namespaces';
import { getServiceMetrics, calculateStats } from '../../keystone';
import { dateRange } from '../../utils';
import { getFeatures, getPlugins } from './features';
import { lookupEnvironmentsByNS } from '../../../services/keystone/product-environment';
import { Environment } from '../../../services/keystone/types';
import { has_feature_protected_externally } from './features/protected_exterrnally';

export interface ReportOfProducts {
  namespace: string;
  display_name?: string;
  prod_name?: string;
  prod_env_active: string;
  prod_env_name?: string;
  prod_env_flow?: string;
  prod_env_app_id?: string;
  features: string[];
}

export async function getProducts(
  ksCtx: Keystone,
  namespaces: ReportOfNamespaces[]
): Promise<ReportOfProducts[]> {
  const dataPromises = namespaces.map(
    async (ns): Promise<ReportOfProducts[]> => {
      const environments = await lookupEnvironmentsByNS(ksCtx, ns.name);
      return environments.map((env) => {
        const product = {
          namespace: ns.name,
          display_name: ns.displayName,
          prod_name: env.product?.name,
          prod_env_name: env.name,
          prod_env_app_id: env.appId,
          prod_env_flow: env.flow,
          prod_env_active: env.active ? 'Y' : 'N',
          features: [],
        } as ReportOfProducts;

        const featureProtectedExternally = has_feature_protected_externally(
          ns,
          product
        );
        if (featureProtectedExternally) {
          product.features.push('protected_externally');
        }
        return product;
      });
    }
  );

  const reportOfReports = await Promise.all(dataPromises);
  return [].concat.apply([], reportOfReports);
}
