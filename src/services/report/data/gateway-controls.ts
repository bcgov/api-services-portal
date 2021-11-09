import { lookupServicesByNamespace } from '../../keystone/gateway-service';
import { GatewayPlugin } from '../../keystone/types';
import { Keystone } from '@keystonejs/keystone';
import { ReportOfNamespaces } from './namespaces';
import { ReportOfGatewayMetrics } from './gateway-metrics';

interface ReportOfGatewayControls {
  namespace: string;
  prod_name?: string;
  prod_env_name?: string;
  service_name: string;
  route_name?: string;
  plugin_name: string;
  plugin_info: string;
}

/*
 */
export async function getGatewayControls(
  ksCtx: Keystone,
  namespaces: ReportOfNamespaces[],
  serviceLookup: Map<string, ReportOfGatewayMetrics>
): Promise<ReportOfGatewayControls[]> {
  const dataPromises = namespaces.map(
    async (ns): Promise<ReportOfGatewayControls[]> => {
      const services = await lookupServicesByNamespace(ksCtx, ns.name);

      // services
      let data: ReportOfGatewayControls[] = [];
      services.forEach((svc) => {
        svc.plugins?.forEach((plugin) => {
          data.push({
            namespace: ns.name,
            prod_name: serviceLookup.get(svc.name)?.prod_name,
            prod_env_name: serviceLookup.get(svc.name)?.prod_env_name,
            service_name: svc.name,
            plugin_name: plugin.name,
            plugin_info: infoOn(plugin),
          });
        });
        svc.routes?.forEach((route) => {
          route.plugins?.forEach((plugin) => {
            data.push({
              namespace: ns.name,
              prod_name: serviceLookup.get(svc.name)?.prod_name,
              prod_env_name: serviceLookup.get(svc.name)?.prod_env_name,
              service_name: svc.name,
              route_name: route.name,
              plugin_name: plugin.name,
              plugin_info: infoOn(plugin),
            });
          });
        });
      });
      return data;
    }
  );

  const reportOfReports = await Promise.all(dataPromises);
  return [].concat.apply([], reportOfReports);
}

export function infoOn(plugin: GatewayPlugin): string {
  return Object.keys(plugin.config)
    .filter((key) => plugin.config[key as any])
    .map((key) => {
      return `${key}=${JSON.stringify(plugin.config[key as any])}`;
    })
    .join(' ; ');
}
