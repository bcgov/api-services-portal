import { Keystone } from '@keystonejs/keystone';
import { ReportOfNamespaces } from './namespaces';
import { GatewayPlugin } from '../../keystone/types';
import { infoOn } from './gateway-controls';
import { lookupDetailedServiceAccessesByNS } from '../../keystone/service-access';

interface ReportOfConsumerControls {
  namespace: string;
  consumer_username: string;
  prod_name?: string;
  prod_env_name?: string;
  service_name: string;
  route_name?: string;
  plugin_name: string;
  plugin_info: string;
}

/*
 */
export async function getConsumerControls(
  ksCtx: Keystone,
  namespaces: ReportOfNamespaces[]
): Promise<ReportOfConsumerControls[]> {
  const dataPromises = namespaces.map(
    async (ns): Promise<ReportOfConsumerControls[]> => {
      const accesses = await lookupDetailedServiceAccessesByNS(ksCtx, ns.name);

      // services
      let data: ReportOfConsumerControls[] = [];
      accesses.forEach((access) => {
        access.consumer?.plugins.forEach((plugin) => {
          const config = { config: JSON.parse(plugin.config) } as GatewayPlugin;
          if (plugin.service != null) {
            data.push({
              namespace: ns.name,
              consumer_username: access.consumer.username,
              service_name: plugin.service.name,
              plugin_name: plugin.name,
              plugin_info: infoOn(config),
            });
          } else if (plugin.route != null) {
            data.push({
              namespace: ns.name,
              consumer_username: access.consumer.username,
              service_name: plugin.route.name,
              route_name: plugin.route.service.name,
              plugin_name: plugin.name,
              plugin_info: infoOn(config),
            });
          } else {
            data.push({
              namespace: ns.name,
              consumer_username: access.consumer.username,
              service_name: '== ALL ==',
              route_name: '== ALL ==',
              plugin_name: plugin.name,
              plugin_info: infoOn(config),
            });
          }
        });
      });
      return data;
    }
  );

  const reportOfReports = await Promise.all(dataPromises);
  return [].concat.apply([], reportOfReports);
}
