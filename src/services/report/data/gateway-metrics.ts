import { lookupServicesByNamespaceForReporting } from '../../keystone/gateway-service';
import { Keystone } from '@keystonejs/keystone';
import { ReportOfNamespaces } from './namespaces';
import { getServiceMetrics, calculateStats } from '../../keystone';
import { dateRange } from '../../utils';
import { getFeatures, getPlugins } from './features';

export interface ReportOfGatewayMetrics {
  namespace: string;
  display_name?: string;
  data_plane: string;
  service_name: string;
  request_uri_host: string;
  prod_name?: string;
  prod_env_name?: string;
  prod_env_app_id?: string;
  day_30_total: number;
  route_names: string;
  plugins: string;
  features: string;
  upstream: string;
}

/*
 */
export async function getGatewayMetrics(
  ksCtx: Keystone,
  namespaces: ReportOfNamespaces[]
): Promise<ReportOfGatewayMetrics[]> {
  const days = dateRange(30);

  const dataPromises = namespaces.map(
    async (ns): Promise<ReportOfGatewayMetrics[]> => {
      const services = await lookupServicesByNamespaceForReporting(
        ksCtx,
        ns.name
      );

      const metrics =
        services.length == 0
          ? []
          : await getServiceMetrics(
              ksCtx,
              services.map((s) => s.name),
              days
            );

      let data: ReportOfGatewayMetrics[] = [];
      const subPromises = services.map(async (svc) => {
        const { totalRequests } = metrics
          ? calculateStats(
              metrics.filter((metric) => metric.service?.name == svc.name)
            )
          : { totalRequests: -1 };

        const prelimRouteList: any[] = [];
        for (const route of svc.routes) {
          for (const host of route.hosts) {
            prelimRouteList.push({
              route_name: route.name,
              request_uri_host: host,
              plugins: getPlugins(ns, services, route.name),
              features: getFeatures(ns, services, route.name),
            });
          }
        }

        // we want to have a row for each request_uri_host
        // and merge/dedup route_name, plugins and features
        const requestUriHosts = [
          ...new Set(prelimRouteList.map((route) => route.request_uri_host)),
        ];

        for (const host of requestUriHosts) {
          const prelimListForRoute = prelimRouteList.filter(
            (route) => route.request_uri_host == host
          );

          data.push({
            namespace: ns.name,
            display_name: ns.displayName,
            data_plane: ns.permDataPlane ?? 'default',
            service_name: svc.name,
            request_uri_host: host,
            upstream: svc.host,
            prod_name: svc.environment?.product?.name,
            prod_env_name: svc.environment?.name,
            prod_env_app_id: svc.environment?.appId,
            day_30_total: totalRequests,
            route_names: prelimListForRoute
              .map((route) => route.route_name)
              .sort()
              .join(', '),
            plugins: mergeAndDedup(
              prelimListForRoute.map((route) => route.plugins)
            ).join(', '),
            features: mergeAndDedup(
              prelimListForRoute.map((route) => route.features)
            ).join(', '),
          });
        }
      });
      await Promise.all(subPromises);

      return data;
    }
  );

  const reportOfReports = await Promise.all(dataPromises);
  return [].concat.apply([], reportOfReports);
}

function mergeAndDedup(items: string[][]): string[] {
  const newList: string[] = [];
  items.forEach((values) => newList.push.apply(newList, values));
  return [...new Set(newList)].sort();
}
