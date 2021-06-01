import { KongConsumerService } from '../kong';
import { FeederService } from '../feeder';

import { addKongConsumer } from '../keystone';

export const AddClientConsumer = async (
  context: any,
  username: string,
  customId: string,
  consumerKongId: string
): Promise<string> => {
  const feederApi = new FeederService(process.env.FEEDER_URL);
  const consumerPK = await addKongConsumer(
    context,
    username,
    customId,
    consumerKongId
  );

  // Call /feeds to sync the Consumer with KeystoneJS
  await feederApi.forceSync('kong', 'consumer', consumerKongId);
  return consumerPK;
};
