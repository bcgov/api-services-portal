const { addKongConsumer } = require('../../services/keystone');

import { KongConsumerService } from '../kong';

/**
 * Steps:
 * - create the Client in the idP
 * - create the corresponding Consumer in Kong
 * - sync the Kong Consumer in KeystoneJS
 *
 * @param {*} credentialIssuerPK
 * @param {*} newClientId
 */
export async function registerApiKey(
  context: any,
  newClientId: string,
  nickname: string,
  app: any
) {
  const kongApi = new KongConsumerService(process.env.KONG_URL);

  const consumer = await kongApi.createKongConsumer(nickname, newClientId, app);

  const apiKey = await kongApi.addKeyAuthToConsumer(consumer.id);

  const consumerPK = await addKongConsumer(
    context,
    nickname,
    newClientId,
    consumer.id
  );

  return {
    apiKey,
    consumer,
    consumerPK,
  };
}
