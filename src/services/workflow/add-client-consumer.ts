import { KongConsumerService } from '../kong';
import { FeederService } from '../feeder';

import { addKongConsumer, searchKongConsumerByCustomId } from '../keystone';

export const AddClientConsumer = async (
  context: any,
  username: string,
  customId: string,
  consumerKongId: string
): Promise<string> => {
  const feederApi = new FeederService(process.env.FEEDER_URL);
  const check = await searchKongConsumerByCustomId(context, customId);

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

export const CreateIfMissingClientConsumer = async (
  context: any,
  username: string,
  customId: string,
  consumerKongId: string
): Promise<string> => {
  const feederApi = new FeederService(process.env.FEEDER_URL);
  const check = await searchKongConsumerByCustomId(context, customId);

  if (check) {
    return check.id;
  }

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
