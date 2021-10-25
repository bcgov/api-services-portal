import { lookupServicesByNamespace } from '../../keystone/gateway-service';
import { Keystone } from '@keystonejs/keystone';
import { ReportOfNamespaces } from './namespaces';
import { getServiceMetrics, calculateStats } from '../../keystone';

interface ReportOfGatewayMetrics {
  namespace: string;
  prod_name?: string;
  prod_env_name?: string;
  service_name: string;
  day_30_total: number;
}

/*
 */
export async function getGatewayMetrics(
  ksCtx: Keystone,
  namespaces: ReportOfNamespaces[]
): Promise<ReportOfGatewayMetrics[]> {
  const dataPromises = namespaces.map(
    async (ns): Promise<ReportOfGatewayMetrics[]> => {
      const services = await lookupServicesByNamespace(ksCtx, ns.name);

      // services
      let data: ReportOfGatewayMetrics[] = [];
      const subPromises = services.map(async (svc) => {
        const days = [
          '2021-10-25',
          '2021-10-24',
          '2021-10-23',
          '2021-10-22',
          '2021-10-21',
        ];
        const metrics = await getServiceMetrics(ksCtx, svc.name, days);

        const { totalRequests } = calculateStats(metrics);

        data.push({
          namespace: ns.name,
          service_name: svc.name,
          day_30_total: totalRequests,
        });
      });
      await Promise.all(subPromises);

      return data;
    }
  );

  const reportOfReports = await Promise.all(dataPromises);
  return [].concat.apply([], reportOfReports);
}
