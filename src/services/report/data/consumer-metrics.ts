import { Keystone } from '@keystonejs/keystone';
import { ReportOfNamespaces } from './namespaces';
import { lookupDetailedServiceAccessesByNS } from '../../keystone/service-access';
import { ReportOfGatewayMetrics } from './gateway-metrics';
import { dateRange } from '../../utils';
import { getConsumerMetrics, calculateStats } from '../../keystone';
import { ReportOfConsumerAccess } from './consumer-access';

interface ReportOfConsumerMetrics {
  namespace: string;
  consumer_username: string;
  prod_name?: string;
  prod_env_name?: string;
  service_name: string;
  day_30_total: number;
}

/*
 */
export async function getReportOfConsumerMetrics(
  ksCtx: Keystone,
  namespaces: ReportOfNamespaces[],
  serviceLookup: Map<string, ReportOfGatewayMetrics>,
  consumerAccess: ReportOfConsumerAccess[]
): Promise<ReportOfConsumerMetrics[]> {
  const dataPromises = namespaces.map(
    async (ns): Promise<ReportOfConsumerMetrics[]> => {
      let data: ReportOfConsumerMetrics[] = [];

      const consumerIdsWithDuplicates = consumerAccess
        .filter((access) => access.namespace === ns.name)
        .map((access) => access.consumer_username);
      const consumerIds = [...new Set(consumerIdsWithDuplicates)];

      const days = dateRange(30);

      for (const consumer of consumerIds) {
        const metrics = await getConsumerMetrics(
          ksCtx,
          ns.name,
          consumer,
          days
        );

        const serviceNamesWithDuplicates = metrics.map(
          (metric) => metric.service.name
        );
        const serviceNames = [...new Set(serviceNamesWithDuplicates)];

        for (const serviceName of serviceNames) {
          const serviceMetrics = metrics.filter(
            (metric) => metric.service.name === serviceName
          );
          const { totalRequests } = calculateStats(serviceMetrics);

          data.push({
            namespace: ns.name,
            consumer_username: consumer,
            prod_name: serviceLookup.get(serviceName)?.prod_name,
            prod_env_name: serviceLookup.get(serviceName)?.prod_env_name,
            service_name: serviceName,
            day_30_total: totalRequests,
          });
        }
      }
      return data;
    }
  );

  const reportOfReports = await Promise.all(dataPromises);
  return [].concat.apply([], reportOfReports);
}
