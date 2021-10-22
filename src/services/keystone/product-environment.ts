import { Logger } from '../../logger';
import { Environment, EnvironmentWhereInput, GatewayService } from './types';

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
                        }
                        credentialIssuer {
                            id
                            flow
                            environmentDetails
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
) {
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
                        }
                    }
                }`,
    variables: { where },
  });
  logger.debug(
    '[lookupEnvironmentAndIssuerUsingWhereClause] result %j',
    result
  );
  assert.strictEqual(
    result.data.allEnvironments.length,
    1,
    'ProductEnvironmentNotFound'
  );
  return result.data.allEnvironments[0];
}

export async function lookupEnvironmentAndIssuerById(context: any, id: string) {
  const result = await context.executeGraphQL({
    query: `query GetCredentialIssuerByEnvironmentId($id: ID!) {
                    Environment(where: {id: $id}) {
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
                            environmentDetails
                            resourceType
                            resourceAccessScope
                        }
                    }
                }`,
    variables: { id: id },
  });
  logger.debug('[lookupEnvironmentAndIssuerById] result %j', result);
  assert.strictEqual(
    result.data.Environment == null,
    false,
    'ProductEnvironmentNotFound ' + id
  );
  return result.data.Environment;
}
