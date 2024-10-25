import {
  GatewayPlugin,
  GatewayService,
} from '../../../../services/keystone/types';
import { ReportOfNamespaces } from '../namespaces';
import { has_feature_api_directory } from './api_directory';
import { has_feature_consumer_mgmt } from './consumer_mgmt';
import { is_production } from './production';
import { has_feature_protected } from './protected';
import { has_feature_protected_externally } from './protected_externally';
import { has_feature_shared_idp } from './shared_idp';
import { has_feature_two_tiered_access } from './two_tiered_access';

export const FeatureList: { [key: string]: Function } = {
  api_directory: has_feature_api_directory,
  shared_idp: has_feature_shared_idp,
  consumer_mgmt: has_feature_consumer_mgmt,
  protected: has_feature_protected,
  protected_externally: has_feature_protected_externally,
  two_tiered_access: has_feature_two_tiered_access,
  production: is_production,
};

export function getFeatures(
  ns: ReportOfNamespaces,
  services: GatewayService[],
  routeName: string
): string[] {
  const service = findService(services, routeName);
  const features: string[] = [];
  Object.entries(FeatureList).forEach((func) => {
    if (func[1](ns, service, routeName)) {
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
