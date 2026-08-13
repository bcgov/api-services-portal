import crypto from 'crypto';
import { strict as assert } from 'assert';
import {
  addApplication,
  addServiceAccess,
  deleteApplication,
  deleteRecord,
  deleteServiceAccess,
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
import {
  getOpenidFromIssuer,
  KeycloakClientRegistrationService,
  KeycloakTokenService,
} from '../keycloak';
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
    typeof context.sudo === 'function' ? context.sudo() : context;

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

  let application: Application | undefined;
  let createdNewApplication = false;
  let serviceAccessId: string | undefined;

  try {
    application = await resolveApplication(
      noauthContext,
      gatewayId,
      input.application
    );
    createdNewApplication = !Boolean(input.application.appId);

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

    const created = await createCredential(
      noauthContext,
      productEnvironment,
      application,
      clientId,
      controls
    );
    serviceAccessId = created.serviceAccessId;

    if (input.labels && Object.keys(input.labels).length > 0) {
      const labels: ConsumerLabel[] = Object.entries(input.labels).map(
        ([labelGroup, value]) => ({
          labelGroup,
          values: [value],
        })
      );
      await saveConsumerLabels(
        noauthContext,
        gatewayId,
        created.consumer.id,
        labels
      );
    }

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
        consumer: created.consumer,
      }
    );

    logger.info(
      '[issueGatewayCredential] Issued %s for gateway %s',
      clientId,
      gatewayId
    );

    return created.newCredential;
  } catch (error) {
    await rollbackIssuance(noauthContext, {
      serviceAccessId,
      createdNewApplication,
      application,
    });
    throw error;
  }
}

async function rollbackIssuance(
  context: any,
  state: {
    serviceAccessId?: string;
    createdNewApplication: boolean;
    application?: Application;
  }
) {
  if (state.serviceAccessId) {
    try {
      // Deleting ServiceAccess invokes existing cleanup hooks for its
      // Keystone consumer and external Kong/IdP credentials.
      await deleteServiceAccess(context, state.serviceAccessId);
    } catch (cleanupError) {
      logger.error(
        '[issueGatewayCredential] Failed to clean up ServiceAccess %s: %s',
        state.serviceAccessId,
        cleanupError
      );
    }
  }

  if (state.createdNewApplication && state.application?.id) {
    try {
      await deleteApplication(context, state.application.id);
    } catch (cleanupError) {
      logger.error(
        '[issueGatewayCredential] Failed to clean up Application %s: %s',
        state.application.id,
        cleanupError
      );
    }
  }
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
  assert.strictEqual(
    openid != null,
    true,
    'Discovery URL invalid for Credential Issuer'
  );

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
  const hasJwks = Boolean(controls.jwksUrl);
  const hasCertificate = Boolean(controls.clientCertificate);
  const hasGeneratedCert = Boolean(controls.clientGenCertificate);

  if (hasJwks) {
    assert.strictEqual(
      await IsJWKSURLValid(controls.jwksUrl),
      true,
      'JWKS Url failed validation'
    );
  } else if (hasCertificate) {
    assert.strictEqual(
      IsCertificateValid(controls.clientCertificate),
      true,
      'Certificate failed validation'
    );
  }

  if (productEnvironment.flow !== 'client-credentials') {
    return;
  }

  const authenticator =
    productEnvironment.credentialIssuer?.clientAuthenticator;

  assert.strictEqual(
    Boolean(authenticator),
    true,
    'Credential Issuer clientAuthenticator is not configured for this Product Environment'
  );

  if (authenticator === 'client-secret') {
    assert.strictEqual(
      hasJwks || hasCertificate || hasGeneratedCert,
      false,
      'client-secret authenticator does not accept jwksUrl, clientCertificate, or clientGenCertificate'
    );
    return;
  }

  if (authenticator === 'client-jwt') {
    assert.strictEqual(
      hasJwks,
      false,
      'client-jwt authenticator does not accept jwksUrl'
    );
    assert.strictEqual(
      hasGeneratedCert || hasCertificate,
      true,
      'client-jwt requires clientGenCertificate or clientCertificate'
    );
    assert.strictEqual(
      hasGeneratedCert && hasCertificate,
      false,
      'Provide only one of clientGenCertificate or clientCertificate'
    );
    return;
  }

  if (authenticator === 'client-jwt-jwks-url') {
    assert.strictEqual(
      hasGeneratedCert,
      false,
      'client-jwt-jwks-url does not accept clientGenCertificate'
    );
    assert.strictEqual(
      hasJwks || hasCertificate,
      true,
      'client-jwt-jwks-url requires jwksUrl or clientCertificate'
    );
    assert.strictEqual(
      hasJwks && hasCertificate,
      false,
      'Provide only one of jwksUrl or clientCertificate'
    );
    return;
  }

  throw new Error(
    `Unsupported clientAuthenticator '${authenticator}' for credential issuance`
  );
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

  let serviceAccessId: string | undefined;
  let kongConsumerExtId: string | undefined;
  let keystoneConsumerId: string | undefined;
  let keycloakClientCreated = false;

  try {
    if (flow == 'kong-api-key-acl' || flow == 'kong-api-key-only') {
      const newApiKey = await registerApiKey(
        context,
        clientId,
        nickname,
        application
      );
      kongConsumerExtId = newApiKey.consumer.id;
      keystoneConsumerId = newApiKey.consumerPK;

      await feederApi.forceSync('kong', 'consumer', newApiKey.consumer.id);

      const credentialReference: CredentialReference = {
        keyAuthPK: newApiKey.apiKey.keyAuthPK,
        clientId,
      };

      const aclEnabled = flow == 'kong-api-key-acl';
      serviceAccessId = await addServiceAccess(
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
      keycloakClientCreated = true;

      const kongApi = new KongConsumerService(process.env.KONG_URL);
      const kongConsumer = await kongApi.createKongConsumer(
        nickname,
        clientId,
        application
      );
      kongConsumerExtId = kongConsumer.id;
      keystoneConsumerId = await AddClientConsumer(
        context,
        nickname,
        clientId,
        kongConsumer.id
      );

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

      serviceAccessId = await addServiceAccess(
        context,
        clientId,
        false,
        false,
        'client',
        credentialReference,
        null,
        keystoneConsumerId,
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
  } catch (error) {
    if (serviceAccessId) {
      try {
        await deleteServiceAccess(context, serviceAccessId);
      } catch (cleanupError) {
        logger.error(
          '[createCredential] Failed to clean up ServiceAccess %s: %s',
          serviceAccessId,
          cleanupError
        );
      }
    } else {
      await cleanupPartialCredentialResources(context, productEnvironment, {
        clientId,
        kongConsumerExtId,
        keystoneConsumerId,
        keycloakClientCreated,
      });
    }
    throw error;
  }
}

async function cleanupPartialCredentialResources(
  context: any,
  productEnvironment: Environment,
  partial: {
    clientId: string;
    kongConsumerExtId?: string;
    keystoneConsumerId?: string;
    keycloakClientCreated: boolean;
  }
) {
  const kongApi = new KongConsumerService(process.env.KONG_URL);

  if (partial.keystoneConsumerId) {
    try {
      await deleteRecord(
        context,
        'GatewayConsumer',
        { id: partial.keystoneConsumerId },
        ['id']
      );
    } catch (cleanupError) {
      logger.error(
        '[createCredential] Failed to clean up Keystone consumer %s: %s',
        partial.keystoneConsumerId,
        cleanupError
      );
    }
  }

  if (partial.kongConsumerExtId) {
    try {
      await kongApi.deleteConsumer(partial.kongConsumerExtId);
    } catch (cleanupError) {
      logger.error(
        '[createCredential] Failed to clean up Kong consumer %s: %s',
        partial.kongConsumerExtId,
        cleanupError
      );
    }
  }

  if (
    partial.keycloakClientCreated &&
    productEnvironment.flow === 'client-credentials' &&
    productEnvironment.credentialIssuer?.id
  ) {
    try {
      const issuer = await lookupCredentialIssuerById(
        context,
        productEnvironment.credentialIssuer.id
      );
      const issuerEnvConfig = getIssuerEnvironmentConfig(
        issuer,
        productEnvironment.name
      );
      const openid = await getOpenidFromIssuer(issuerEnvConfig.issuerUrl);
      const token =
        issuerEnvConfig.clientRegistration == 'anonymous'
          ? null
          : issuerEnvConfig.clientRegistration == 'managed'
          ? await new KeycloakTokenService(
              openid.token_endpoint
            ).getKeycloakSession(
              issuerEnvConfig.clientId,
              issuerEnvConfig.clientSecret
            )
          : issuerEnvConfig.initialAccessToken;

      await new KeycloakClientRegistrationService(
        issuerEnvConfig.issuerUrl,
        openid.registration_endpoint,
        token
      ).deleteClientRegistration(partial.clientId);
    } catch (cleanupError) {
      logger.error(
        '[createCredential] Failed to clean up Keycloak client %s: %s',
        partial.clientId,
        cleanupError
      );
    }
  }
}
