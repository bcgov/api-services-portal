const { addKongConsumer, deleteRecord } = require('../../services/keystone');

import { Application } from '../keystone/types';
import { KongConsumerService } from '../kong';
import { Logger } from '../../logger';

const logger = Logger('wf.KongApiKey');

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
  app: Application
) {
  const kongApi = new KongConsumerService(process.env.KONG_URL);
  let consumer: any;

  try {
    consumer = await kongApi.createKongConsumer(nickname, newClientId, app);

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
  } catch (error) {
    if (consumer?.id) {
      try {
        await deleteRecord(
          context,
          'GatewayConsumer',
          { extForeignKey: consumer.id },
          ['id']
        );
      } catch (cleanupError) {
        logger.error(
          '[registerApiKey] Failed to clean up Keystone consumer for %s: %s',
          consumer.id,
          cleanupError
        );
      }

      try {
        await kongApi.deleteConsumer(consumer.id);
      } catch (cleanupError) {
        logger.error(
          '[registerApiKey] Failed to clean up Kong consumer %s: %s',
          consumer.id,
          cleanupError
        );
      }
    }
    throw error;
  }
}
