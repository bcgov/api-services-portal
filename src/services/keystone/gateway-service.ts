import { Logger } from '../../logger';
import { GatewayService } from './types';

const logger = Logger('keystone.gw-service');

export async function lookupServices(
  context: any,
  serviceIds: string[]
): Promise<GatewayService[]> {
  if (serviceIds.length == 0) {
    return [];
  }
  const result = await context.executeGraphQL({
    query: `query GetServices($services: [ID]) {
                    allGatewayServices(where: {id_in: $services}) {
                            name
                            plugins {
                                name
                                config
                            }
                            routes {
                                name
                                plugins {
                                    name
                                    config
                                }
                            }
                    }
                }`,
    variables: { services: serviceIds },
  });
  logger.debug('Query result %j', result);
  result.data.allGatewayServices.map((svc: GatewayService) =>
    svc.plugins?.map((plugin) => (plugin.config = JSON.parse(plugin.config)))
  );
  return result.data.allGatewayServices;
}
