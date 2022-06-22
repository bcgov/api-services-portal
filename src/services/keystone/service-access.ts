import { Logger } from '../../logger';
import {
  Application,
  Environment,
  ServiceAccess,
  ServiceAccessCreateInput,
} from './types';
import { strict as assert } from 'assert';
const logger = Logger('keystone.svc-access');

export async function lookupCredentialReferenceByServiceAccess(
  context: any,
  id: string
): Promise<ServiceAccess> {
  const result = await context.executeGraphQL({
    query: `query GetSpecificServiceAccess($id: ID!) {
                    allServiceAccesses(where: {id: $id}) {
                        id
                        consumerType
                        productEnvironment {
                            id
                            name
                            additionalDetailsToRequest
                            flow
                            credentialIssuer {
                                id
                                clientAuthenticator
                            }
                        }
                        application {
                          name
                          owner {
                            name
                            username
                            email
                          }
                        }
                        consumer {
                            id
                            username
                            customId
                            extForeignKey
                        }
                        credentialReference
                    }
                }`,
    variables: { id },
  });
  logger.debug(
    'Query [lookupCredentialReferenceByServiceAccess] result %j',
    result
  );
  assert.strictEqual(
    result.data.allServiceAccesses.length,
    1,
    'ServiceAccessNotFound'
  );

  result.data.allServiceAccesses[0].credentialReference = JSON.parse(
    result.data.allServiceAccesses[0].credentialReference
  );
  return result.data.allServiceAccesses[0];
}

export async function lookupDetailedServiceAccessesByNS(
  context: any,
  ns: string
): Promise<ServiceAccess[]> {
  const result = await context.executeGraphQL({
    query: `query GetDetailedServiceAccessesByNS($where: ServiceAccessWhereInput!) {
                    allServiceAccesses(where: $where) {
                        id
                        consumerType
                        productEnvironment {
                            id
                            appId
                            name
                            flow
                            product {
                              name
                            }
                            credentialIssuer {
                              id
                              name
                            }
                        }
                        application {
                          name
                          appId
                          owner {
                            username
                          }
                        }
                        consumer {
                          id
                          username
                          customId
                          extForeignKey
                          updatedAt

                          plugins {
                            id
                            name
                            config
                            service {
                              id
                              name
                            }
                            route {
                              id
                              name
                              service {
                                name
                              }
                            }
                          }
                        }
                    }
                }`,
    variables: {
      where: {
        OR: [
          { namespace: ns },
          { productEnvironment: { product: { namespace: ns } } },
        ],
      },
    },
  });
  logger.debug(
    'Query [lookupDetailedServiceAccessesByNS] result row count %d',
    result.data.allServiceAccesses.length
  );
  return result.data.allServiceAccesses;
}

export async function lookupServiceAccessesByNamespace(
  context: any,
  ns: string
): Promise<ServiceAccess[]> {
  const result = await context.executeGraphQL({
    query: `query GetServiceAccessByNamespace($ns: String!) {
                    allServiceAccesses(where: {namespace: $ns}) {
                        id
                        consumer {
                            username
                        }
                    }
                }`,
    variables: { ns: ns },
  });
  logger.debug(
    '[lookupServiceAccessesByNamespace] result row count %d',
    result.data.allServiceAccesses.length
  );
  return result.data.allServiceAccesses;
}

export async function lookupServiceAccessesByEnvironment(
  context: any,
  ns: string,
  envIds: string[]
): Promise<ServiceAccess[]> {
  logger.debug(
    '[lookupServiceAccessesByEnvironment] lookup ns=%s %j',
    ns,
    envIds
  );

  const result = await context.executeGraphQL({
    query: `query GetServiceAccessByEnvironment($ns: String!, $envIds: [ID]!) {
                    allServiceAccesses(where: { productEnvironment: { id_in: $envIds, product: { namespace: $ns } } } ) {
                        id
                        active
                        namespace
                        consumer {
                          username
                          customId
                        }
                        application {
                          name
                          owner {
                            name
                            email
                          }
                        }
                        productEnvironment {
                          name
                          flow
                          product {
                            name
                          }
                        }
                    }
                }`,
    variables: { ns, envIds },
  });

  assert.strictEqual(
    'errors' in result,
    false,
    `Unexpected errors ${JSON.stringify(result.errors)}`
  );
  logger.debug(
    '[lookupServiceAccessesByEnvironment] result row count %d',
    result.data.allServiceAccesses.length
  );
  return result.data.allServiceAccesses;
}

export async function lookupServiceAccessesForNamespace(
  context: any,
  ns: string
): Promise<ServiceAccess[]> {
  logger.debug('[lookupServiceAccessesForNamespace] lookup ns=%s', ns);

  const result = await context.executeGraphQL({
    query: `query GetServiceAccessByNamespace($ns: String!) {
                    allServiceAccesses(where: { namespace: $ns }) {
                        id
                        active
                        namespace
                        consumer {
                          username
                          customId
                        }
                        application {
                          name
                          owner {
                            name
                            email
                          }
                        }
                        productEnvironment {
                          name
                          flow
                          product {
                            name
                          }
                        }
                    }
                }`,
    variables: { ns },
  });

  assert.strictEqual(
    'errors' in result,
    false,
    `Unexpected errors ${JSON.stringify(result.errors)}`
  );
  logger.debug(
    '[lookupServiceAccessesForNamespace] result row count %d',
    result.data.allServiceAccesses.length
  );
  return result.data.allServiceAccesses;
}

export async function lookupLabeledServiceAccessesForNamespace(
  context: any,
  ns: string
): Promise<ServiceAccess[]> {
  logger.debug('[lookupLabeledServiceAccessesForNamespace] lookup ns=%s', ns);

  const result = await context.executeGraphQL({
    query: `query GetLabeledServiceAccessByNamespace($ns: String!) {
                    allServiceAccesses(where: { OR: [{ namespace: $ns}, { productEnvironment: { product: { namespace: $ns }}}]}) {
                        id
                        consumerType
                        consumer {
                          id
                          username
                          customId
                        }
                        application {
                          labels(namespace: $ns) {
                            name
                            value
                          }
                        }
                        updatedAt
                    }
                }`,
    variables: { ns },
  });

  assert.strictEqual(
    'errors' in result,
    false,
    `Unexpected errors ${JSON.stringify(result.errors)}`
  );
  logger.debug(
    '[lookupLabeledServiceAccessesForNamespace] result row count %d',
    result.data.allServiceAccesses.length
  );
  logger.debug(
    '[lookupLabeledServiceAccessesForNamespace] result %j',
    result.data.allServiceAccesses
  );
  return result.data.allServiceAccesses;
}

export async function lookupServiceAccessesByConsumer(
  context: any,
  ns: string,
  consumerId: string
): Promise<ServiceAccess[]> {
  const result = await context.executeGraphQL({
    query: `query GetSpecificServiceAccessByConsumer($ns: String!, $consumerId: ID!) {
                    allServiceAccesses(where: { consumer: { id: $consumerId }, productEnvironment: { product: { namespace: $ns } } } ) {
                        id
                        namespace
                        consumerType
                        productEnvironment {
                            id
                            name
                            appId
                            flow
                            product {
                              name
                            }
                            credentialIssuer {
                                id
                                clientAuthenticator
                            }
                        }
                    }
                }`,
    variables: { ns, consumerId },
  });
  logger.debug('Query [lookupServiceAccessesByConsumer] result %j', result);

  return result.data.allServiceAccesses;
}

export async function addServiceAccess(
  context: any,
  name: string,
  active: boolean,
  aclEnabled: boolean,
  consumerType: string,
  credentialReference: any,
  clientRoles: string[],
  consumerPK: string,
  productEnvironment: Environment,
  application: Application,
  namespace: string = null
): Promise<string> {
  const data = {
    name,
    active,
    aclEnabled,
    consumerType,
  } as ServiceAccessCreateInput;

  data.clientRoles = JSON.stringify(clientRoles == null ? [] : clientRoles);
  data.consumer = { connect: { id: consumerPK } };
  productEnvironment != null &&
    (data.productEnvironment = { connect: { id: productEnvironment.id } });
  application != null &&
    (data.application = { connect: { id: application.id } });
  credentialReference != null &&
    (data.credentialReference = JSON.stringify(credentialReference));
  data.namespace = namespace;

  logger.debug('[addServiceAccess] %j', data);

  const result = await context.executeGraphQL({
    query: `mutation CreateServiceAccess($data: ServiceAccessCreateInput) {
                    createServiceAccess(data: $data) {
                        id
                    }
                }`,
    variables: { data },
  });
  logger.debug('[addServiceAccess] RESULT %j', result);
  return result.data.createServiceAccess.id;
}

export async function markActiveTheServiceAccess(
  context: any,
  serviceAccessId: string
): Promise<ServiceAccess> {
  const result = await context.executeGraphQL({
    query: `mutation UpdateConsumerInServiceAccess($serviceAccessId: ID!) {
                    updateServiceAccess(id: $serviceAccessId, data: { active: true } ) {
                        id
                    }
                }`,
    variables: { serviceAccessId },
  });
  logger.debug('[markActiveTheServiceAccess] RESULT %j', result);
  return result.data.updateServiceAccess;
}

export async function linkCredRefsToServiceAccess(
  context: any,
  serviceAccessId: string,
  credentialReference: any
): Promise<ServiceAccess> {
  const credRefAsString = JSON.stringify(credentialReference);
  const result = await context.executeGraphQL({
    query: `mutation UpdateConsumerInServiceAccess($serviceAccessId: ID!, $credRefAsString: String) {
                    updateServiceAccess(id: $serviceAccessId, data: { active: true, credentialReference: $credRefAsString } ) {
                        id
                    }
                }`,
    variables: { serviceAccessId, credRefAsString },
  });
  logger.debug('[linkCredRefsToServiceAccess] RESULT %j', result);
  return result.data.updateServiceAccess;
}
