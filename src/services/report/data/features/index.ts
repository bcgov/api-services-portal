import {
  GatewayPlugin,
  GatewayService,
} from '../../../../services/keystone/types';
import { ReportOfNamespaces } from '../namespaces';
import {
  has_feature_api_directory_for_product,
  has_feature_api_directory_for_service,
} from './api_directory';
import { has_feature_consumer_mgmt } from './consumer_mgmt';
import { has_feature_dataset_in_catalog } from './dataset_in_catalog';
import { has_gateway_mgmt } from './has_gateway_mgmt';
import { is_production } from './production';
import { has_feature_protected } from './protected';
import { has_feature_protected_externally } from './protected_exterrnally';
import { has_feature_shared_idp } from './shared_idp';
import { has_feature_two_tiered_access } from './two_tiered_access';

export const ProductFeatureList: { [key: string]: Function } = {
  consumer_mgmt: has_feature_consumer_mgmt,
  protected_externally: has_feature_protected_externally,
  dataset_in_catalog: has_feature_dataset_in_catalog,
  api_directory: has_feature_api_directory_for_product,
};

export const FeatureList: { [key: string]: Function } = {
  api_directory: has_feature_api_directory_for_service, // evaluated at a Gateway level
  shared_idp: has_feature_shared_idp,
  gateway_mgmt: has_gateway_mgmt,
  consumer_mgmt: undefined, // evaluated at a Gateway level
  protected: has_feature_protected,
  two_tiered_access: has_feature_two_tiered_access,
  production: is_production,
  protected_externally: undefined, // evaluated at a Gateway level
  dataset_in_catalog: undefined, // evaluated at a Gateway level
};

export function getFeatures(
  ns: ReportOfNamespaces,
  services: GatewayService[],
  routeName: string
): string[] {
  const service = findService(services, routeName);
  const features: string[] = [];
  Object.entries(FeatureList).forEach((func) => {
    if (func[1] && func[1](ns, service, routeName)) {
      features.push(func[0]);
    }
  });
  return features;
}

export function getPlugins(
  ns: ReportOfNamespaces,
  services: GatewayService[],
  routeName: string
): string[] {
  const plugins: string[] = [];
  const service = findService(services, routeName);

  plugins.push.apply(plugins, getPluginNames(service.plugins));
  service.routes.forEach((route) => {
    plugins.push.apply(plugins, getPluginNames(route.plugins));
  });
  return [...new Set(plugins)].sort();
}

function findService(
  services: GatewayService[],
  routeName: string
): GatewayService {
  return services
    .filter((s) => s.routes.filter((r) => r.name == routeName).length > 0)
    .pop();
}

function getPluginNames(plugins: GatewayPlugin[]): string[] {
  return plugins?.map((p) => p.name);
}
