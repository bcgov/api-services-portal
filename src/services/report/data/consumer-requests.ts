import { lookupServicesByNamespace } from '../../keystone/gateway-service';
import { GatewayPlugin } from '../../keystone/types';
import { Keystone } from '@keystonejs/keystone';
import { ReportOfNamespaces } from './namespaces';
import { ReportOfGatewayMetrics } from './gateway-metrics';
import { getAccessRequestsByNamespace } from '../../keystone';

interface ReportOfConsumerRequest {
  namespace: string;
  prod_name: string;
  prod_env_name: string;
  prod_env_app_id: string;
  prod_env_flow: string;
  app_name: string;
  app_id: string;
  requestor: string;
  req_created: string;
  req_reviewer: string;
  req_result: string;
  consumer_username: string;
}

/*
 */
export async function getConsumerRequests(
  ksCtx: Keystone,
  namespaces: ReportOfNamespaces[]
): Promise<ReportOfConsumerRequest[]> {
  const dataPromises = namespaces.map(
    async (ns): Promise<ReportOfConsumerRequest[]> => {
      const requests = await getAccessRequestsByNamespace(ksCtx, ns.name);

      // services
      let data: ReportOfConsumerRequest[] = [];

      requests.forEach((req) => {
        data.push({
          namespace: ns.name,
          prod_name: req.productEnvironment?.product?.name,
          prod_env_name: req.productEnvironment?.name,
          prod_env_app_id: req.productEnvironment?.appId,
          prod_env_flow: req.productEnvironment?.flow,
          app_name: req.application.name,
          app_id: req.application.appId,
          requestor: req.requestor.username,
          req_created: req.createdAt,
          req_reviewer: '',
          req_result: req.isComplete
            ? req.isApproved
              ? 'Approved'
              : 'Rejected'
            : 'Pending',
          consumer_username: req.serviceAccess.consumer.username,
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
