import { Logger } from '../../logger';
import { GatewayConsumer } from './types';

const assert = require('assert').strict;
const logger = Logger('keystone.gw-consumer');

export async function lookupConsumerPlugins(
  context: any,
  id: string
): Promise<GatewayConsumer> {
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
    variables: { id: id },
  });
  logger.debug('Query [lookupConsumerPlugins] result %j', result);

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

export async function searchKongConsumerByCustomId(
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

  if ('error' in result || result.data.allGatewayConsumers.length == 0) {
    return undefined;
  } else {
    return result.data.allGatewayConsumers[0];
  }
}

export async function lookupKongConsumerByCustomId(
  context: any,
  name: string
): Promise<GatewayConsumer> {
  const consumer = await searchKongConsumerByCustomId(context, name);
  assert.strictEqual(
    typeof consumer === 'undefined',
    false,
    'Unexpected data returned for Consumer lookup'
  );
  return consumer;
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
  return 'error' in result ? null : result.data.createGatewayConsumer.id;
}
