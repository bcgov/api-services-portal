import { lookupServicesByNamespaceForReporting } from '../../keystone/gateway-service';
import { Keystone } from '@keystonejs/keystone';
import { ReportOfNamespaces } from './namespaces';
import { getServiceMetrics, calculateStats } from '../../keystone';
import { dateRange } from '../../utils';
import { getFeatures, getPlugins, ProductFeatureList } from './features';
import { lookupEnvironmentsByNS } from '../../../services/keystone/product-environment';
import { Environment } from '../../../services/keystone/types';
import { has_feature_protected_externally } from './features/protected_exterrnally';
import { has_feature_dataset_in_catalog } from './features/dataset_in_catalog';

export interface ReportOfProducts {
  namespace: string;
  display_name?: string;
  prod_name?: string;
  prod_env_active: 'Y' | 'N';
  prod_env_approval: 'Y' | 'N';
  prod_env_name?: string;
  prod_env_flow?: string;
  prod_env_app_id?: string;
  dataset_name?: string;
  dataset_title?: string;
  dataset_in_catalog: boolean;
  service_names?: string[];
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
          prod_env_approval: env.approval ? 'Y' : 'N',
          dataset_name: env.product?.dataset?.name,
          dataset_title: env.product?.dataset?.title,
          dataset_in_catalog: env.product?.dataset?.isInCatalog,
          service_names: env.services.map((s) => s.name),
          features: [],
        } as ReportOfProducts;

        Object.entries(ProductFeatureList).forEach((func) => {
          if (func[1] && func[1](ns, product)) {
            product.features.push(func[0]);
          }
        });
        return product;
      });
    }
  );

  const reportOfReports = await Promise.all(dataPromises);
  return [].concat.apply([], reportOfReports);
}
