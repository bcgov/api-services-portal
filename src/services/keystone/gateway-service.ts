import { Logger } from '../../logger';
import { GatewayRoute, GatewayService } from './types';

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

export async function lookupKongServiceIds(
  context: any,
  serviceIds: string[]
): Promise<GatewayService[]> {
  if (serviceIds.length == 0) {
    return [];
  }
  const result = await context.executeGraphQL({
    query: `query MapKongServices($serviceIds: [ID]) {
                    allGatewayServices(where: {id_in: $serviceIds}) {
                      id
                      name
                      extForeignKey
                    }
                }`,
    variables: { serviceIds },
  });
  return result.data.allGatewayServices;
}

export async function lookupKongRouteIds(
  context: any,
  routeIds: string[]
): Promise<GatewayRoute[]> {
  if (routeIds.length == 0) {
    return [];
  }
  const result = await context.executeGraphQL({
    query: `query MapKongRoutes($routeIds: [ID]) {
                    allGatewayRoutes(where: {id_in: $routeIds}) {
                      id
                      name
                      extForeignKey
                    }
                }`,
    variables: { routeIds },
  });
  return result.data.allGatewayRoutes;
}

export async function lookupServicesByNamespace(
  context: any,
  ns: string
): Promise<GatewayService[]> {
  const result = await context.executeGraphQL({
    query: `query GetServices($ns: String!) {
                    allGatewayServices(where: {namespace: $ns}) {
                            name
                            plugins {
                                name
                                config
                            }
                            routes {
                                name
                                methods
                                hosts
                                paths
                                plugins {
                                    name
                                    config
                                }
                            }
                            environment {
                              name
                              appId
                              product {
                                name
                              }
                            }
                    }
                }`,
    variables: { ns: ns },
  });
  logger.debug('Query result %j', result);
  result.data.allGatewayServices.forEach((svc: GatewayService) => {
    svc.plugins?.map((plugin) => (plugin.config = JSON.parse(plugin.config)));
    svc.routes?.map((route) =>
      route.plugins?.map(
        (plugin) => (plugin.config = JSON.parse(plugin.config))
      )
    );
  });
  return result.data.allGatewayServices;
}
