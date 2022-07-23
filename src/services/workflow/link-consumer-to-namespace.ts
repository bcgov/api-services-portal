import { registerClient, findClient } from './client-credentials';
import { v4 as uuidv4 } from 'uuid';
import {
  lookupProductEnvironmentServicesBySlug,
  lookupCredentialIssuerById,
  markActiveTheServiceAccess,
  lookupKongConsumerByUsername,
  addServiceAccess,
} from '../keystone';
import { KongConsumerService } from '../kong';
import { AddClientConsumer } from './add-client-consumer';
import { NewCredential, RequestControls } from './types';
import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from './types';
import {
  KeycloakClientRegistrationService,
  KeycloakTokenService,
  getOpenidFromIssuer,
} from '../keycloak';
import { FeederService } from '../feeder';
import { Logger } from '../../logger';

const logger = Logger('wf.LinkConsumer');

export const LinkConsumerToNamespace = async (
  context: any,
  namespace: any,
  consumerType: string,
  consumerUsername?: string
): Promise<string> => {
  const kongApi = new KongConsumerService(process.env.KONG_URL);
  const consumerResult = await kongApi.createOrGetConsumer(
    consumerUsername,
    null
  );
  const consumerPK: any = { id: null };

  if (consumerResult.created) {
    consumerPK.id = await AddClientConsumer(
      context,
      consumerUsername,
      null,
      consumerResult.consumer.id
    );
  } else {
    const feederApi = new FeederService(process.env.FEEDER_URL);
    await feederApi.forceSync('kong', 'consumer', consumerResult.consumer.id);
    const consumer = await lookupKongConsumerByUsername(
      context,
      consumerUsername
    );
    consumerPK.id = consumer.id;
  }

  // Create a ServiceAccess record
  const serviceAccessId = await addServiceAccess(
    context,
    `${consumerUsername} access to ${namespace}`,
    true,
    false,
    consumerType,
    {},
    null,
    consumerPK.id,
    null,
    null,
    namespace
  );

  return serviceAccessId;
};
