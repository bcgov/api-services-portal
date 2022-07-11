import { Logger } from '../../logger';
import { GatewayConsumer } from './types';

import { strict as assert } from 'assert';

const logger = Logger('keystone.gw-consumer');

export async function lookupConsumerPlugins(
  context: any,
  id: string
): Promise<GatewayConsumer> {
  logger.debug('Query [lookupConsumerPlugins] ID %s', id);
  const result = await context.executeGraphQL({
    query: `query GetConsumerPlugins($id: ID!) {
                    allGatewayConsumers(where: {id: $id}) {
                        id
                        username
                        aclGroups
                        customId
                        extForeignKey
                        namespace
                        plugins {
                          id
                          name
                          config
                          service {
                            id
                            name
                            environment {
                              id
                            }
                          }
                          route {
                            id
                            name
                          }
                        }
                        tags
                        createdAt
                  
                    }
                }`,
    variables: { id },
  });
  logger.debug('Query [lookupConsumerPlugins] result %j', result);

  assert.strictEqual(
    result.data.allGatewayConsumers.length,
    1,
    `Consumer record missing ${id}`
  );

  return result.data.allGatewayConsumers[0];
}

export async function lookupKongConsumerId(
  context: any,
  id: string
): Promise<string> {
  const result = await context.executeGraphQL({
    query: `query FindConsumerByUsername($where: GatewayConsumerWhereInput) {
                    allGatewayConsumers(where: $where) {
                        extForeignKey
                    }
                }`,
    variables: { where: { id: id } },
  });
  logger.debug('Query [lookupKongConsumerId] result %j', result);

  assert.strictEqual(
    result.data.allGatewayConsumers.length,
    1,
    'Unexpected data returned for Consumer lookup'
  );
  return result.data.allGatewayConsumers[0].extForeignKey;
}

export async function lookupKongConsumerIds(
  context: any,
  ids: string[]
): Promise<GatewayConsumer[]> {
  const result = await context.executeGraphQL({
    query: `query FindConsumersByIds($where: GatewayConsumerWhereInput) {
                    allGatewayConsumers(where: $where) {
                      id
                    }
                }`,
    variables: { where: { extForeignKey_in: ids } },
  });
  logger.debug('Query [lookupKongConsumerIds] result %j', result);

  // assert.strictEqual(
  //   result.data.allGatewayConsumers.length,
  //   ids.length,
  //   `Unexpected data returned for Consumer lookup ${ids.length} ${result.data.allGatewayConsumers.length}`
  // );
  return result.data.allGatewayConsumers;
}

export async function lookupKongConsumerIdByName(
  context: any,
  name: string
): Promise<string> {
  assert.strictEqual(
    name != null && typeof name != 'undefined' && name != '',
    true,
    'Invalid Consumer Username'
  );
  const result = await context.executeGraphQL({
    query: `query FindConsumerByUsername($where: GatewayConsumerWhereInput) {
                    allGatewayConsumers(where: $where) {
                        extForeignKey
                    }
                }`,
    variables: { where: { username: name } },
  });
  logger.debug('Query [lookupKongConsumerIdByName] result %j', result);

  assert.strictEqual(
    result.data.allGatewayConsumers.length,
    1,
    'Unexpected data returned for Consumer lookup'
  );
  return result.data.allGatewayConsumers[0].extForeignKey;
}

export async function lookupKongConsumerByCustomId(
  context: any,
  name: string
): Promise<GatewayConsumer> {
  assert.strictEqual(
    name != null && typeof name != 'undefined' && name != '',
    true,
    'Invalid Consumer CustomId'
  );
  const result = await context.executeGraphQL({
    query: `query FindConsumerByUsername($where: GatewayConsumerWhereInput) {
                    allGatewayConsumers(where: $where) {
                        id
                        extForeignKey
                    }
                }`,
    variables: { where: { customId: name } },
  });
  logger.debug('Query [lookupKongConsumerByCustomId] result %j', result);

  assert.strictEqual(
    result.data.allGatewayConsumers.length,
    1,
    'Unexpected data returned for Consumer lookup'
  );
  return result.data.allGatewayConsumers[0];
}

export async function lookupKongConsumerByUsername(
  context: any,
  name: string
): Promise<GatewayConsumer> {
  assert.strictEqual(
    name != null && typeof name != 'undefined' && name != '',
    true,
    'Invalid Consumer Username'
  );
  const result = await context.executeGraphQL({
    query: `query FindConsumerByUsername($where: GatewayConsumerWhereInput) {
                  allGatewayConsumers(where: $where) {
                      id
                      extForeignKey
                  }
              }`,
    variables: { where: { username: name } },
  });
  logger.debug('Query [lookupKongConsumerByUsername] result %j', result);

  assert.strictEqual(
    result.data.allGatewayConsumers.length,
    1,
    'Unexpected data returned for Consumer lookup'
  );
  return result.data.allGatewayConsumers[0];
}

export async function addKongConsumer(
  context: any,
  username: string,
  customId: string,
  extForeignKey: string
): Promise<string> {
  logger.debug(
    'Mutation [addKongConsumer] username=%s kongid=%s',
    username,
    extForeignKey
  );

  // This should actually go away and the "Feeders" should be used
  const result = await context.executeGraphQL({
    query: `mutation CreateNewConsumer($username: String, $customId: String, $extForeignKey: String) {
                    createGatewayConsumer(data: { username: $username, customId: $customId, extForeignKey: $extForeignKey, extSource: "kong", extRecordHash: "00000", tags: "[]" }) {
                        id
                        extForeignKey
                    }
                }`,
    variables: { username, customId, extForeignKey },
  });
  logger.debug('Mutation [addKongConsumer] result %j', result);
  return result.data.createGatewayConsumer.id;
}
