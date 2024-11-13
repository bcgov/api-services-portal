import { gql } from 'graphql-request';
import { Logger } from '../../logger';
import { AccessRequest, AccessRequestUpdateInput } from './types';

const assert = require('assert').strict;
const logger = Logger('keystone.access-req');

export async function getAccessRequestsByNamespace(
  context: any,
  ns: string
): Promise<AccessRequest[]> {
  const query = gql`
    query GetNamespaceAccessRequests($ns: String!) {
      allAccessRequests(
        where: { productEnvironment: { product: { namespace: $ns } } }
      ) {
        id
        name
        isApproved
        isIssued
        isComplete
        requestor {
          name
          username
          providerUsername
        }
        application {
          name
          appId
        }
        requestor {
          username
        }
        productEnvironment {
          name
          appId
          flow
          product {
            name
          }
        }
        serviceAccess {
          id
          consumer {
            username
          }
        }
        createdAt
      }
    }
  `;

  const result = await context.executeGraphQL({ query, variables: { ns } });
  logger.debug('Query [getAccessRequestsByNamespace] result %j', result);
  return result.data.allAccessRequests;
}

export async function getAccessRequestByNamespaceServiceAccess(
  context: any,
  ns: string,
  serviceAccessId: string
): Promise<AccessRequest> {
  logger.debug(
    '[getAccessRequestByNamespaceServiceAccess] %s %s',
    ns,
    serviceAccessId
  );
  const query = gql`
    query GetNamespaceAccessRequestByServiceAccess(
      $ns: String!
      $serviceAccessId: ID!
    ) {
      allAccessRequests(
        where: {
          serviceAccess: { id: $serviceAccessId }
          productEnvironment: { product: { namespace: $ns } }
        }
      ) {
        id
        name
        isApproved
        isIssued
        isComplete
        additionalDetails
        requestor {
          username
        }
        application {
          name
          appId
        }
        requestor {
          username
        }
        productEnvironment {
          name
          appId
          flow
          product {
            name
          }
        }
        serviceAccess {
          id
          consumer {
            username
          }
        }
        createdAt
      }
    }
  `;

  const result = await context.executeGraphQL({
    query,
    variables: { ns, serviceAccessId },
  });
  logger.debug('[getAccessRequestByNamespaceServiceAccess] result %j', result);

  return result.data.allAccessRequests.length == 0
    ? undefined
    : result.data.allAccessRequests[0];
}

export async function getOpenAccessRequestsByConsumer(
  context: any,
  ns: string,
  consumerId: string
): Promise<AccessRequest[]> {
  logger.debug(
    '[getOpenAccessRequestsByConsumer] ns=%s consumer=%s',
    ns,
    consumerId
  );
  const query = gql`
    query GetNamespaceOpenAccessRequestsByConsumer(
      $ns: String!
      $consumerId: String!
    ) {
      allAccessRequests(
        where: {
          serviceAccess: { consumer: { id: $consumerId } }
          isComplete: false
        }
      ) {
        id
        name
        isApproved
        isIssued
        isComplete
        additionalDetails
        serviceAccess {
          id
          consumer {
            username
          }
        }
        createdAt
      }
    }
  `;

  const result = await context.executeGraphQL({
    query,
    variables: { ns, consumerId },
  });
  logger.debug('[getOpenAccessRequestsByConsumer] result %j', result);

  assert.strictEqual(
    'errors' in result,
    false,
    'Error retrieving access request record'
  );

  return result.data.allAccessRequests;
}

export async function lookupEnvironmentAndApplicationByAccessRequest(
  context: any,
  id: string
): Promise<AccessRequest> {
  const result = await context.executeGraphQL({
    query: `query GetSpecificAccessRequest($id: ID!) {
                  AccessRequest(where: {id: $id}) {
                      id
                      labels
                      controls
                      productEnvironment {
                          appId
                          id
                          name
                          flow
                          approval
                          credentialIssuer {
                              id
                          }
                          product {
                              name
                              namespace
                          }
                      }
                      application {
                          id
                          appId
                          name
                      }
                      serviceAccess {
                          id
                          consumer {
                              id
                              customId
                              extForeignKey
                          }
                      }
                  }
              }`,
    variables: { id: id },
  });
  logger.debug(
    'Query [lookupEnvironmentAndApplicationByAccessRequest] result %j',
    result
  );
  return result.data.AccessRequest;
}

export async function linkServiceAccessToRequest(
  context: any,
  serviceAccessId: string,
  requestId: string
): Promise<AccessRequest> {
  const result = await context.executeGraphQL({
    query: `mutation LinkServiceAccessToRequest($serviceAccessId: ID!, $requestId: ID!) {
                    updateAccessRequest(id: $requestId, data: { serviceAccess: { connect: { id: $serviceAccessId } } } ) {
                        id
                    }
                }`,
    variables: { serviceAccessId, requestId },
  });
  logger.debug('Mutation [linkServiceAccessToRequest] result %j', result);
  logger.debug(
    'Linked Service Access %s to Access Request %s',
    serviceAccessId,
    requestId
  );

  assert.strictEqual(
    'errors' in result,
    false,
    'Error linking service access to request'
  );
  return result.data.updateAccessRequest;
}

export async function markAccessRequestAsNotIssued(
  context: any,
  requestId: string
): Promise<AccessRequest> {
  const result = await context.executeGraphQL({
    query: `mutation MarkRequestNotIssued($requestId: ID!) {
                    updateAccessRequest(id: $requestId, data: { isComplete: false, isIssued: false } ) {
                        id
                    }
                }`,
    variables: { requestId },
  });
  logger.debug('Mutation [markAccessRequestAsNotIssued] result %j', result);

  assert.strictEqual(
    'errors' in result,
    false,
    'Error marking request as not issued'
  );
  return result.data.updateAccessRequest;
}

export async function updateAccessRequestState(
  context: any,
  requestId: string,
  data: AccessRequestUpdateInput
): Promise<AccessRequest> {
  // { isComplete: false, isApproved: false, isIssued: false }
  const result = await context.executeGraphQL({
    query: `mutation MarkRequestNotIssued($requestId: ID!, $data: AccessRequestUpdateInput) {
                    updateAccessRequest(id: $requestId, data: $data ) {
                        id
                    }
                }`,
    variables: { requestId, data },
  });
  logger.debug('Mutation [markAccessRequestAsNotIssued] result %j', result);

  assert.strictEqual(
    'errors' in result,
    false,
    'Error marking request as not issued'
  );
  return result.data.updateAccessRequest;
}
