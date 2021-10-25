import { Keystone } from '@keystonejs/keystone';
import { ReportOfNamespaces } from './namespaces';
import { lookupDetailedServiceAccessesByNS } from '../../keystone/service-access';

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
export async function getConsumerMetrics(
  ksCtx: Keystone,
  namespaces: ReportOfNamespaces[]
): Promise<ReportOfConsumerMetrics[]> {
  const dataPromises = namespaces.map(
    async (ns): Promise<ReportOfConsumerMetrics[]> => {
      const accesses = await lookupDetailedServiceAccessesByNS(ksCtx, ns.name);

      let data: ReportOfConsumerMetrics[] = [];
      accesses.forEach((access) => {
        data.push({
          namespace: ns.name,
          consumer_username: '',
          service_name: '',
          day_30_total: 0,
        });
      });
      return data;
    }
  );

  const reportOfReports = await Promise.all(dataPromises);
  return [].concat.apply([], reportOfReports);
}
