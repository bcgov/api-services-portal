import {
  linkCredRefsToServiceAccess,
  lookupCredentialReferenceByServiceAccess,
} from '../keystone';
import { strict as assert } from 'assert';

import { Logger } from '../../logger';
import { ClientAuthenticator, KeycloakClientService } from '../keycloak';
import { getEnvironmentContext } from './get-namespaces';
import { CredentialReference, NewCredential, RequestControls } from './types';

import { fetchWithTimeout } from '../utils';

import { createPublicKey } from 'crypto';

const logger = Logger('wf.UpdCreds');

export const UpdateCredentials = async (
  context: any,
  serviceAccessId: string,
  controls: RequestControls
): Promise<void> => {
  logger.debug('[UpdateCredentials] %s : %j', serviceAccessId, controls);

  assert.strictEqual(
    Boolean(controls.jwksUrl) && Boolean(controls.clientCertificate),
    false,
    'Only one of JWKS Url or Client Certificate are required.'
  );

  const serviceAccess = await lookupCredentialReferenceByServiceAccess(
    context,
    serviceAccessId
  );

  const flow = serviceAccess.productEnvironment.flow;
  const clientAuthenticator =
    serviceAccess.productEnvironment?.credentialIssuer?.clientAuthenticator;

  assert.strictEqual(
    flow === 'client-credentials' &&
      clientAuthenticator === ClientAuthenticator.ClientJWTwithJWKS,
    true,
    'Unsupported authenticator type'
  );

  const noauthContext = context.createContext({
    skipAccessControl: true,
  });
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

  const credentialReference = {
    flow: serviceAccess.productEnvironment.flow,
    clientId: serviceAccess.consumer.customId,
    clientCertificate: controls.clientCertificate,
    jwksUrl: controls.jwksUrl,
    issuer: envCtx.openid.issuer,
    tokenEndpoint: envCtx.openid.token_endpoint,
  } as CredentialReference;

  if (controls.jwksUrl) {
    assert.strictEqual(
      await IsJWKSURLValid(controls.jwksUrl),
      true,
      'JWKS Url failed validation.'
    );

    await kcClientService.updateJwksUrl(client, controls.jwksUrl);
  } else {
    assert.strictEqual(
      IsCertificateValid(controls.clientCertificate),
      true,
      'Certificate failed validation.'
    );

    await kcClientService.updateCertificate(
      client,
      controls.clientCertificate.trim()
    );
  }

  await linkCredRefsToServiceAccess(
    noauthContext,
    serviceAccessId,
    credentialReference
  );
};

export const IsCertificateValid = (cert: string): boolean => {
  try {
    const x509 = createPublicKey(cert.trim());
    logger.debug('[ValidateCertificate] %s', x509.asymmetricKeyType);
    return true;
  } catch (ex) {
    logger.debug('[ValidateCertificate] Failed %s', ex);
    return false;
  }
};

export const IsJWKSURLValid = async (url: string): Promise<boolean> => {
  try {
    new URL(url);

    const options = { timeout: 2000 };

    const response = await fetchWithTimeout(url, options);
    assert.strictEqual(response.ok, true, 'Failed to get JWKS document');

    await response.json();
    return true;
  } catch (ex) {
    logger.debug('[ValidateCertificate] Failed %s', ex);
    return false;
  }
};
