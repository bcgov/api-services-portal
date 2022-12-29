import { Logger } from '../../logger';
import {
  Environment,
  EnvironmentWhereInput,
  GatewayService,
  Product,
} from './types';

const assert = require('assert').strict;
const logger = Logger('keystone.prod-env');

export async function lookupProductEnvironmentServices(
  context: any,
  prodEnvId: string
): Promise<Environment> {
  const result = await context.executeGraphQL({
    query: `query GetProductEnvironmentServices($prodEnvId: ID!) {
                    allEnvironments(where: {id: $prodEnvId}) {
                        appId
                        id
                        name
                        flow
                        approval
                        product {
                            namespace
                            dataset {
                              id
                              organization {
                                name
                              }
                              organizationUnit {
                                name
                              }
                            }
                        }
                        credentialIssuer {
                            id
                            flow
                            environmentDetails
                            inheritFrom {
                              environmentDetails
                            }
                            clientId
                        }
                        services {
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
                    }
                }`,
    variables: { prodEnvId },
  });
  logger.debug('[lookupProductEnvironmentServices] result %j', result);
  assert.strictEqual(
    result.data.allEnvironments.length,
    1,
    'ProductEnvironmentNotFound ' + prodEnvId
  );

  result.data.allEnvironments[0].services.map((svc: GatewayService) =>
    svc.plugins?.map((plugin) => (plugin.config = JSON.parse(plugin.config)))
  );
  return result.data.allEnvironments[0];
}

export async function lookupProductEnvironmentServicesBySlug(
  context: any,
  appId: string
): Promise<Environment> {
  const result = await context.executeGraphQL({
    query: `query GetProductEnvironmentServicesBySlug($appId: String!) {
                    allEnvironments(where: {appId: $appId}) {
                        appId
                        id
                        name
                        flow
                        product {
                            namespace
                        }
                        credentialIssuer {
                            id
                            flow
                            resourceType
                            resourceScopes
                        }
                        services {
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
                    }
                }`,
    variables: { appId: appId },
  });
  logger.debug('[lookupProductEnvironmentServicesBySlug] result %j', result);
  assert.strictEqual(
    result.data.allEnvironments.length,
    1,
    'ProductEnvironmentNotFound By Slug ' + appId
  );
  result.data.allEnvironments[0].services.map((svc: GatewayService) =>
    svc.plugins?.map((plugin) => (plugin.config = JSON.parse(plugin.config)))
  );
  return result.data.allEnvironments[0];
}

export async function lookupEnvironmentAndIssuerUsingWhereClause(
  context: any,
  where: EnvironmentWhereInput
): Promise<Environment> {
  logger.debug('[lookupEnvironmentAndIssuerUsingWhereClause] WHERE %j', where);
  const result = await context.executeGraphQL({
    query: `query GetCredentialIssuerByWhereClause($where: EnvironmentWhereInput!) {
                    allEnvironments(where: $where) {
                        id
                        name
                        approval
                        legal {
                            reference
                        }
                        credentialIssuer {
                            name
                            flow
                            mode
                            availableScopes
                            clientRoles
                            resourceType
                            resourceAccessScope
                            environmentDetails
                            clientId
                            inheritFrom {
                              name
                              environmentDetails
                            }
                        }
                    }
                }`,
    variables: { where },
  });
  // logger.debug(
  //   '[lookupEnvironmentAndIssuerUsingWhereClause] result %j',
  //   result
  // );
  assert.strictEqual(
    result.data.allEnvironments.length,
    1,
    'ProductEnvironmentNotFound'
  );
  return result.data.allEnvironments[0];
}

export async function lookupEnvironmentsByNS(
  context: any,
  ns: string
): Promise<Environment[]> {
  logger.debug('[lookupEnvironmentsByNS] WHERE ns=%s', ns);
  const result = await context.executeGraphQL({
    query: `query GetEnvironmentsByNamespace($ns: String!) {
                    allEnvironments(where: { product: { namespace: $ns } }) {
                        id
                        appId
                        name
                        flow
                        additionalDetailsToRequest
                        approval
                        product {
                          id
                          name
                        }
                        legal {
                          reference
                        }
                        credentialIssuer {
                          id
                          name
                          flow
                          mode
                          availableScopes
                          clientRoles
                          resourceType
                          resourceAccessScope
                          environmentDetails
                        }
                    }
                }`,
    variables: { ns },
  });
  logger.debug(
    '[lookupEnvironmentsByNS] result count %d',
    result.data.allEnvironments.length
  );
  return result.data.allEnvironments;
}

export async function lookupEnvironmentAndIssuerById(
  context: any,
  id: string
): Promise<Environment> {
  const result = await context.executeGraphQL({
    query: `query GetCredentialIssuerByEnvironmentId($id: ID!) {
                    Environment(where: {id: $id}) {
                        id
                        appId
                        name
                        flow
                        active
                        approval
                        legal {
                            reference
                        }
                        product {
                            name
                            namespace
                        }
                        credentialIssuer {
                            name
                            flow
                            mode
                            environmentDetails
                            inheritFrom {
                              environmentDetails
                            }
                            clientId
                            resourceType
                            resourceAccessScope
                        }
                    }
                }`,
    variables: { id: id },
  });
  // logger.debug('[lookupEnvironmentAndIssuerById] result %j', result);
  if (result.errors) {
    logger.error('[lookupEnvironmentAndIssuerById] %j', result.errors);
  }
  assert.strictEqual(
    result.data.Environment == null,
    false,
    'ProductEnvironmentNotFound ' + id
  );
  return result.data.Environment;
}

export async function lookupProduct(context: any, ns: string, id: string) {
  const result = await context.executeGraphQL({
    query: `query GetProduct($ns: String!, $id: ID!) {
                    Product(where: {namespace: $ns, id: $id}) {
                        environments {
                          id
                        }
                    }
                }`,
    variables: { ns, id },
  });
  logger.debug('[lookupProduct] result %j', result);
  assert.strictEqual(
    result.data.Product == null,
    false,
    'ProductNotFound ' + id
  );
  return result.data.Product;
}

export async function lookupProductDataset(context: any, id: string) {
  const result = await context.executeGraphQL({
    query: `query GetProduct($id: ID!) {
                    Product(where: {id: $id}) {
                      namespace
                      dataset {
                        id
                        name
                        organization {
                          name
                        }
                        organizationUnit {
                          name
                        }
                      }
                    }
                }`,
    variables: { id },
  });
  logger.debug('[lookupProductDataset] result %j', result);
  assert.strictEqual(
    result.data.Product == null,
    false,
    'ProductNotFound ' + id
  );
  return result.data.Product;
}
