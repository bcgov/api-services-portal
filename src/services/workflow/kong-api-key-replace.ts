const { addKongConsumer } = require('../../services/keystone');

import { KongConsumerService } from '../kong';

/**
 * Steps:
 * - lookup the Kong Consumer
 * - remove the previous Key
 * - add a new key
 *
 * @param {*} clientId
 * @param {*} oldKeyAuthId
 */
export async function replaceApiKey(clientId: string, oldKeyAuthId: string) {
  const kongApi = new KongConsumerService(
    process.env.KONG_URL,
    process.env.GWA_API_URL
  );

  const consumer = await kongApi.getConsumerByUsername(clientId);

  await kongApi.delKeyAuthFromConsumer(consumer.id, oldKeyAuthId);

  const apiKey = await kongApi.addKeyAuthToConsumer(consumer.id);

  return {
    apiKey,
  };
}
