import crypto from 'crypto';
import { strict as assert } from 'assert';
import {
  addApplication,
  addServiceAccess,
  lookupApplicationByAppId,
  lookupCredentialIssuerById,
  lookupEnvironmentByAppIdInNamespace,
  lookupKongConsumerByCustomId,
  lookupProductEnvironmentServices,
} from '../keystone';
import { FeederService } from '../feeder';
import { KongConsumerService } from '../kong';
import { Logger } from '../../logger';
import {
  Application,
  Environment,
} from '../keystone/types';
import {
  CredentialReference,
  ConsumerLabel,
  getIssuerEnvironmentConfig,
  IssuerEnvironmentConfig,
  NewCredential,
  RequestControls,
} from './types';
import { registerClient } from './client-credentials';
import { registerApiKey } from './kong-api-key';
import { AddClientConsumer } from './add-client-consumer';
import { IsCertificateValid, IsJWKSURLValid } from './update-credential';
import { getOpenidFromIssuer } from '../keycloak';
import { isBlank } from './common';
import { setupAuthorizationAndEnable } from './apply';
import { saveConsumerLabels } from './consumer-management';
import { parsePluginConfig } from '../keystone/gateway-service';

const logger = Logger('wf.IssueGatewayCred');

const ISSUABLE_FLOWS = [
  'kong-api-key-acl',
  'kong-api-key-only',
  'client-credentials',
];

export interface IssueGatewayCredentialApplication {
  appId?: string;
  name?: string;
  description?: string;
}

export interface IssueGatewayCredentialInput {
  environmentAppId: string;
  application: IssueGatewayCredentialApplication;
  labels?: Record<string, string>;
  controls?: RequestControls;
}

/**
 * Issue a consumer credential for a product environment in the caller's gateway.
 * Creates or reuses an Application (owner optional, namespace = gateway), then
 * creates Consumer + ServiceAccess and enables access immediately.
 */
export async function issueGatewayCredential(
  context: any,
  gatewayId: string,
  input: IssueGatewayCredentialInput
): Promise<NewCredential> {
  assert.strictEqual(
    Boolean(input?.environmentAppId),
    true,
    'environmentAppId is required'
  );
  assert.strictEqual(
    Boolean(input?.application),
    true,
    'application is required'
  );

  const controls: RequestControls = { ...(input.controls || {}) };
  const noauthContext =
    typeof context.sudo === 'function'
      ? context.sudo()
      : context;

  const environment = await lookupEnvironmentByAppIdInNamespace(
    noauthContext,
    input.environmentAppId,
    gatewayId
  );

  // Ensure plugin config is parsed (lookupEnvironmentsByNS returns raw JSON strings)
  if (environment.services) {
    parsePluginConfig(environment.services);
  }

  // Prefer full product-environment lookup for credential generation parity
  const productEnvironment = await lookupProductEnvironmentServices(
    noauthContext,
    environment.id
  );

  assert.strictEqual(
    productEnvironment.product?.namespace === gatewayId,
    true,
    `Environment does not belong to gateway ${gatewayId}`
  );

  assert.strictEqual(
    ISSUABLE_FLOWS.includes(productEnvironment.flow),
    true,
    `Flow '${productEnvironment.flow}' does not support credential issuance`
  );

  await validateIssuerForFlow(noauthContext, productEnvironment);
  await validateControls(controls, productEnvironment);

  const application = await resolveApplication(
    noauthContext,
    gatewayId,
    input.application
  );

  const clientId = `${productEnvironment.appId}-${application.appId}`;

  const existingConsumer = await lookupKongConsumerByCustomId(
    noauthContext,
    clientId,
    false
  );
  assert.strictEqual(
    typeof existingConsumer === 'undefined',
    true,
    'This application already has access to this environment'
  );

  const { newCredential, serviceAccessId, consumer } = await createCredential(
    noauthContext,
    productEnvironment,
    application,
    clientId,
    controls
  );

  await setupAuthorizationAndEnable(
    context,
    noauthContext,
    productEnvironment,
    {
      flow: productEnvironment.flow,
      namespace: gatewayId,
      controls,
      environmentName: productEnvironment.name,
      environmentAppId: productEnvironment.appId,
      credentialIssuerId: productEnvironment.credentialIssuer?.id,
      serviceAccessId,
      consumer,
    }
  );

  if (input.labels && Object.keys(input.labels).length > 0) {
    const labels: ConsumerLabel[] = Object.entries(input.labels).map(
      ([labelGroup, value]) => ({
        labelGroup,
        values: [value],
      })
    );
    await saveConsumerLabels(noauthContext, gatewayId, consumer.id, labels);
  }

  logger.info(
    '[issueGatewayCredential] Issued %s for gateway %s',
    clientId,
    gatewayId
  );

  return newCredential;
}

async function resolveApplication(
  context: any,
  gatewayId: string,
  applicationInput: IssueGatewayCredentialApplication
): Promise<Application> {
  if (applicationInput.appId) {
    const existing = await lookupApplicationByAppId(
      context,
      applicationInput.appId,
      gatewayId
    );
    assert.strictEqual(
      existing != null,
      true,
      `Application ${applicationInput.appId} not found in gateway ${gatewayId}`
    );
    return existing;
  }

  assert.strictEqual(
    Boolean(applicationInput.name),
    true,
    'application.name is required when creating a new Application'
  );

  return addApplication(context, {
    name: applicationInput.name,
    description: applicationInput.description,
    namespace: gatewayId,
  });
}

async function validateIssuerForFlow(
  context: any,
  productEnvironment: Environment
) {
  if (productEnvironment.flow !== 'client-credentials') {
    return;
  }

  assert.strictEqual(
    productEnvironment.credentialIssuer != null,
    true,
    'Credential Issuer not configured for this Product Environment'
  );

  const issuer = await lookupCredentialIssuerById(
    context,
    productEnvironment.credentialIssuer.id
  );
  assert.strictEqual(issuer != null, true, 'Invalid Credential Issuer');

  if (issuer.mode == 'manual') {
    throw new Error('Manual credential issuing not supported');
  }

  const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(
    issuer,
    productEnvironment.name
  );

  if (
    issuer.flow == 'client-credentials' &&
    issuerEnvConfig.clientRegistration == 'anonymous'
  ) {
    throw new Error('Anonymous client registration not supported');
  }

  const openid = await getOpenidFromIssuer(issuerEnvConfig.issuerUrl);
  assert.strictEqual(openid != null, true, 'Discovery URL invalid for Credential Issuer');

  const clientRegistration = issuerEnvConfig.clientRegistration;
  assert.strictEqual(
    ['anonymous', 'managed', 'iat'].includes(clientRegistration),
    true,
    'Client Registration setting is missing from the Issuer'
  );
  assert.strictEqual(
    clientRegistration == 'managed' &&
      (isBlank(issuerEnvConfig.clientId) ||
        isBlank(issuerEnvConfig.clientSecret)),
    false,
    'Managed Client Registration requires a Client ID and Secret'
  );
  assert.strictEqual(
    clientRegistration == 'iat' && isBlank(issuerEnvConfig.initialAccessToken),
    false,
    'Initial Access Token is required when doing client registration via an IAT'
  );
}

async function validateControls(
  controls: RequestControls,
  productEnvironment: Environment
) {
  if (controls.jwksUrl) {
    assert.strictEqual(
      await IsJWKSURLValid(controls.jwksUrl),
      true,
      'JWKS Url failed validation'
    );
  } else if (controls.clientCertificate) {
    assert.strictEqual(
      IsCertificateValid(controls.clientCertificate),
      true,
      'Certificate failed validation'
    );
  }

  if (
    productEnvironment.flow === 'client-credentials' &&
    productEnvironment.credentialIssuer?.clientAuthenticator ===
      'client-jwt-jwks-url'
  ) {
    // Caller may supply jwksUrl or certificate depending on authenticator; soft check only
  }
}

async function createCredential(
  context: any,
  productEnvironment: Environment,
  application: Application,
  clientId: string,
  controls: RequestControls
): Promise<{
  newCredential: NewCredential;
  serviceAccessId: string;
  consumer: any;
}> {
  const feederApi = new FeederService(process.env.FEEDER_URL);
  const flow = productEnvironment.flow;
  const nickname = clientId;

  if (flow == 'kong-api-key-acl' || flow == 'kong-api-key-only') {
    const newApiKey = await registerApiKey(
      context,
      clientId,
      nickname,
      application
    );

    await feederApi.forceSync('kong', 'consumer', newApiKey.consumer.id);

    const credentialReference: CredentialReference = {
      keyAuthPK: newApiKey.apiKey.keyAuthPK,
      clientId,
    };

    const aclEnabled = flow == 'kong-api-key-acl';
    const serviceAccessId = await addServiceAccess(
      context,
      clientId,
      false,
      aclEnabled,
      'client',
      credentialReference,
      null,
      newApiKey.consumerPK,
      productEnvironment,
      application
    );

    const consumer = await lookupKongConsumerByCustomId(context, clientId);

    return {
      newCredential: {
        flow,
        apiKey: newApiKey.apiKey.apiKey,
        clientId,
      } as NewCredential,
      serviceAccessId,
      consumer,
    };
  }

  if (flow == 'client-credentials') {
    const clientSigning: any = { publicKey: null, privateKey: null };

    if (controls.clientGenCertificate) {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });
      clientSigning.publicKey = publicKey;
      clientSigning.privateKey = privateKey;
      controls.clientCertificate = clientSigning.publicKey;
    }

    const newClient = await registerClient(
      context,
      productEnvironment.name,
      productEnvironment.credentialIssuer.id,
      controls,
      clientId
    );

    const kongApi = new KongConsumerService(process.env.KONG_URL);
    const kongConsumer = await kongApi.createKongConsumer(
      nickname,
      clientId,
      application
    );
    const consumerPK = await AddClientConsumer(
      context,
      nickname,
      clientId,
      kongConsumer.id
    );

    await feederApi.forceSync('kong', 'consumer', kongConsumer.id);

    const credentialReference: CredentialReference = {
      id: newClient.client.id,
      clientId: newClient.client.clientId,
      clientCertificate: controls.clientCertificate,
      jwksUrl: controls.jwksUrl,
      issuer:
        controls.jwksUrl || controls.clientCertificate
          ? newClient.openid.issuer
          : null,
      tokenEndpoint: newClient.openid.token_endpoint,
    };

    const serviceAccessId = await addServiceAccess(
      context,
      clientId,
      false,
      false,
      'client',
      credentialReference,
      null,
      consumerPK,
      productEnvironment,
      application
    );

    const consumer = await lookupKongConsumerByCustomId(context, clientId);

    return {
      newCredential: {
        flow: productEnvironment.flow,
        clientId: newClient.client.clientId,
        clientSecret: controls.clientGenCertificate
          ? null
          : newClient.client.clientSecret,
        issuer:
          controls.jwksUrl || controls.clientCertificate
            ? newClient.openid.issuer
            : null,
        tokenEndpoint: newClient.openid.token_endpoint,
        clientPublicKey: clientSigning.publicKey,
        clientPrivateKey: clientSigning.privateKey,
      } as NewCredential,
      serviceAccessId,
      consumer,
    };
  }

  throw new Error(`Unsupported flow: ${flow}`);
}
