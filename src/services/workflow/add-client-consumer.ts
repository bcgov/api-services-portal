
import { KongConsumerService } from '../kong'
import { FeederService } from '../feeder'

import {
    addKongConsumer
} from '../keystone'

export const AddClientConsumer = async (context: any, nickname: string, clientId: string, consumerKongId: string) : Promise<string> => {
    const feederApi = new FeederService(process.env.FEEDER_URL)
    const consumerPK = await addKongConsumer(context, nickname, clientId, consumerKongId)

    // Call /feeds to sync the Consumer with KeystoneJS
    await feederApi.forceSync('kong', 'consumer', consumerKongId)
    return consumerPK
}
