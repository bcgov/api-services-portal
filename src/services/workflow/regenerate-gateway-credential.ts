import crypto from 'crypto';
import { strict as assert } from 'assert';
import {
  linkCredRefsToServiceAccess,
  lookupServiceAccessByName,
} from '../keystone';
import {
  ClientAuthenticator,
  KeycloakClientService,
} from '../keycloak';
import { Logger } from '../../logger';
import {
  CredentialReference,
  NewCredential,
} from './types';
import { getEnvironmentContext } from './get-namespaces';
import { replaceApiKey } from './kong-api-key-replace';

const logger = Logger('wf.RegenGatewayCred');

/**
 * Regenerate credentials in place for an existing consumer (same clientId).
 * Mirrors GraphQL regenerateCredentials, scoped to a gateway.
 */
export async function regenerateGatewayCredential(
  context: any,
  gatewayId: string,
  clientId: string
): Promise<NewCredential> {
  assert.strictEqual(
    Boolean(clientId),
    true,
    'clientId is required'
  );

  const noauthContext =
    typeof context.sudo === 'function' ? context.sudo() : context;

  const serviceAccess = await lookupServiceAccessByName(
    noauthContext,
    clientId,
    gatewayId
  );

  assert.strictEqual(
    serviceAccess.productEnvironment?.product?.namespace === gatewayId ||
      serviceAccess.namespace === gatewayId,
    true,
    `Consumer ${clientId} does not belong to gateway ${gatewayId}`
  );

  const flow = serviceAccess.productEnvironment.flow;
  const clientAuthenticator = serviceAccess.productEnvironment
    ?.credentialIssuer?.clientAuthenticator as ClientAuthenticator;

  if (flow === 'kong-api-key-acl' || flow === 'kong-api-key-only') {
    const newApiKey = await replaceApiKey(
      clientId,
      (serviceAccess.credentialReference as CredentialReference).keyAuthPK
    );

    const credentialReference: CredentialReference = {
      keyAuthPK: newApiKey.apiKey.keyAuthPK,
      clientId,
    };

    await linkCredRefsToServiceAccess(
      noauthContext,
      serviceAccess.id,
      credentialReference
    );

    logger.info(
      '[regenerateGatewayCredential] Rotated API key for %s in %s',
      clientId,
      gatewayId
    );

    return {
      flow,
      clientId,
      apiKey: newApiKey.apiKey.apiKey,
    } as NewCredential;
  }

  if (flow === 'client-credentials') {
    const envCtx = await getEnvironmentContext(
      noauthContext,
      serviceAccess.productEnvironment.id,
      {},
      false
    );

    const kcClientService = new KeycloakClientService(
      envCtx.issuerEnvConfig.issuerUrl
    );
    await kcClientService.login(
      envCtx.issuerEnvConfig.clientId,
      envCtx.issuerEnvConfig.clientSecret
    );

    const client = await kcClientService.findByClientId(
      serviceAccess.consumer.customId
    );

    const newCredential = {
      flow,
      clientId: serviceAccess.consumer.customId,
      issuer: envCtx.openid.issuer,
      tokenEndpoint: envCtx.openid.token_endpoint,
    } as NewCredential;

    if (clientAuthenticator === 'client-secret') {
      newCredential.clientSecret = await kcClientService.regenerateSecret(
        client.id
      );
    } else if (clientAuthenticator === 'client-jwt') {
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

      // Match update-credential / issue paths: set jwt.credential.public.key
      // via attributes rather than the multipart upload-certificate endpoint.
      await kcClientService.updateCertificate(client, publicKey);
      newCredential.clientPrivateKey = privateKey;
      newCredential.clientPublicKey = publicKey;
    } else {
      throw new Error(
        `Regenerate not supported for authenticator '${clientAuthenticator}'`
      );
    }

    logger.info(
      '[regenerateGatewayCredential] Rotated client credentials for %s in %s',
      clientId,
      gatewayId
    );

    return newCredential;
  }

  throw new Error(`Invalid Service Access Action for flow '${flow}'`);
}
