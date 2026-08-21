import { FeederService } from '../feeder';
import { Logger } from '../../logger';

import { addKongConsumer, deleteRecord } from '../keystone';

const logger = Logger('wf.AddClientConsumer');

export const AddClientConsumer = async (
  context: any,
  username: string,
  customId: string,
  consumerKongId: string
): Promise<string> => {
  const feederApi = new FeederService(process.env.FEEDER_URL);
  let consumerPK: string | undefined;

  try {
    consumerPK = await addKongConsumer(
      context,
      username,
      customId,
      consumerKongId
    );

    // Call /feeds to sync the Consumer with KeystoneJS
    await feederApi.forceSync('kong', 'consumer', consumerKongId);
    return consumerPK;
  } catch (error) {
    try {
      await deleteRecord(
        context,
        'GatewayConsumer',
        consumerPK ? { id: consumerPK } : { extForeignKey: consumerKongId },
        ['id']
      );
    } catch (cleanupError) {
      logger.error(
        '[AddClientConsumer] Failed to clean up Keystone consumer for %s: %s',
        consumerKongId,
        cleanupError
      );
    }
    throw error;
  }
};
