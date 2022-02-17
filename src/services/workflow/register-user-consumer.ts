import {
  lookupProductEnvironmentServices,
  lookupEnvironmentAndApplicationByAccessRequest,
  lookupApplication,
  addServiceAccess,
  linkServiceAccessToRequest,
  lookupBrokeredIdentities,
  createBrokeredIdentity,
} from '../keystone';
import crypto from 'crypto';
import { strict as assert } from 'assert';
import {
  AddClientConsumer,
  CreateIfMissingClientConsumer,
} from './add-client-consumer';
import { FeederService } from '../feeder';
import { KongConsumerService } from '../kong';
import { AccountLink, NewCredential, RequestControls } from './types';
import { registerClient } from './client-credentials';
import { registerApiKey } from './kong-api-key';
import { Logger } from '../../logger';
import {
  AccessRequest,
  BrokeredIdentity,
  BrokeredIdentityCreateInput,
} from '../keystone/types';
import { getAccountLinkUrl } from '.';

const logger = Logger('wf.RegUserConsumer');

export const registerUserConsumer = async (
  context: any,
  requestDetails: AccessRequest
): Promise<NewCredential> => {
  const controls: RequestControls =
    'controls' in requestDetails ? JSON.parse(requestDetails.controls) : {};

  const flow = requestDetails.productEnvironment.flow;

  assert.strictEqual(
    ['authorization-code'].includes(flow),
    true,
    'invalid_flow'
  );

  logger.debug('[registerUserConsumer]');

  const productEnvironment = await lookupProductEnvironmentServices(
    context,
    requestDetails.productEnvironment.id
  );

  const brokerAlias = `${productEnvironment.credentialIssuer.identityProviderPrefix}-${productEnvironment.name}`;

  const accountLink: AccountLink = await getAccountLinkUrl(
    context,
    requestDetails.productEnvironment.id,
    undefined
  );

  assert.strictEqual(
    accountLink && accountLink.linkedIdentities.length === 1,
    true,
    'Problem getting brokered identity details'
  );

  if (accountLink.linkedIdentities.length === 1) {
    const linkedUser = accountLink.linkedIdentities[0];
    const id: BrokeredIdentityCreateInput = {
      providerAlias: linkedUser.identityProvider,
      userId: linkedUser.userId,
      username: linkedUser.userName,
      owner: { connect: { id: context.authedItem.userId } },
    };
    await createBrokeredIdentity(context, id);
  }

  // Lookup the BrokeredIdentity record
  const brokeredIdentities: BrokeredIdentity[] = await lookupBrokeredIdentities(
    context,
    requestDetails.requestor.id
  );

  const matchedBrokerIdentity = brokeredIdentities
    .filter((id) => id.providerAlias === brokerAlias)
    .pop();

  logger.debug('[registerUserConsumer] Broker ID %j', matchedBrokerIdentity);
  // use the Requester user username to lookup in Authz the User ID, and then to get the Federated Identities
  // for the Subject ID

  // const application = await lookupApplication(
  //   context,
  //   requestDetails.application.id
  // );

  // clientId will be the remote Subject ID
  // nickname will be the username '@' brokerAlias
  //
  const _username = matchedBrokerIdentity.username.replace(/@/g, '-');
  const subjectId = matchedBrokerIdentity.userId;

  const nickname = `${_username}@${brokerAlias}`;

  controls.clientCertificate = null;

  const kongApi = new KongConsumerService(
    process.env.KONG_URL,
    process.env.GWA_API_URL
  );

  const consumer = (await kongApi.createOrGetConsumer(nickname, subjectId))
    .consumer;
  const consumerPK = await CreateIfMissingClientConsumer(
    context,
    nickname,
    subjectId,
    consumer.id
  );

  const credentialReference = {
    id: subjectId,
  };
  // Create a ServiceAccess record
  const consumerType = 'user';
  const aclEnabled = false;
  const serviceAccessId = await addServiceAccess(
    context,
    `${subjectId}-${requestDetails.id}`,
    false,
    aclEnabled,
    consumerType,
    credentialReference,
    null,
    consumerPK,
    productEnvironment,
    undefined,
    undefined,
    matchedBrokerIdentity
  );

  await linkServiceAccessToRequest(context, serviceAccessId, requestDetails.id);

  return {
    flow: productEnvironment.flow,
  } as NewCredential;
};
