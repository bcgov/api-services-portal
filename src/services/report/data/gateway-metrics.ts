import { lookupServicesByNamespace } from '../../keystone/gateway-service';
import { Keystone } from '@keystonejs/keystone';
import { ReportOfNamespaces } from './namespaces';
import { getServiceMetrics, calculateStats } from '../../keystone';
import { dateRange } from '../../utils';

export interface ReportOfGatewayMetrics {
  namespace: string;
  prod_name?: string;
  prod_env_name?: string;
  prod_env_app_id?: string;
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

      let data: ReportOfGatewayMetrics[] = [];
      const subPromises = services.map(async (svc) => {
        const days = dateRange(30);
        const metrics = await getServiceMetrics(ksCtx, svc.name, days);

        const { totalRequests } = calculateStats(metrics);

        data.push({
          namespace: ns.name,
          service_name: svc.name,
          prod_name: svc.environment?.product?.name,
          prod_env_name: svc.environment?.name,
          prod_env_app_id: svc.environment?.appId,
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
