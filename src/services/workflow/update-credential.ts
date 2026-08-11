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
import dns from 'dns';
import net from 'net';

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

const JWKS_MAX_REDIRECTS = 3;
const BLOCKED_JWKS_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
]);

function isDisallowedIpAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true; // link-local
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // shared address space
    if (a >= 224) return true; // multicast / reserved
    return false;
  }

  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    if (normalized === '::1' || normalized === '::') return true;
    if (normalized.startsWith('::ffff:')) {
      return isDisallowedIpAddress(normalized.slice('::ffff:'.length));
    }
    // Unique local fc00::/7
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    // Link-local fe80::/10
    if (/^fe[89ab]/i.test(normalized)) return true;
    return false;
  }

  return true;
}

async function assertSafeJwksUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch (ex) {
    throw new Error('JWKS Url is not a valid URL');
  }

  assert.strictEqual(
    parsed.protocol,
    'https:',
    'JWKS Url must use HTTPS'
  );
  assert.strictEqual(
    parsed.username === '' && parsed.password === '',
    true,
    'JWKS Url must not include credentials'
  );

  const hostname = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  assert.strictEqual(
    BLOCKED_JWKS_HOSTNAMES.has(hostname),
    false,
    'JWKS Url host is not allowed'
  );

  if (net.isIP(hostname)) {
    assert.strictEqual(
      isDisallowedIpAddress(hostname),
      false,
      'JWKS Url host is not allowed'
    );
  } else {
    const addresses = await dns.promises.lookup(hostname, {
      all: true,
      verbatim: true,
    });
    assert.strictEqual(
      addresses.length > 0,
      true,
      'JWKS Url host could not be resolved'
    );
    for (const addr of addresses) {
      assert.strictEqual(
        isDisallowedIpAddress(addr.address),
        false,
        'JWKS Url resolves to a disallowed address'
      );
    }
  }

  return parsed;
}

/**
 * Validate a JWKS URL is reachable JSON and is not an SSRF vector.
 * Requires HTTPS, blocks loopback/private/link-local destinations, and
 * re-validates each redirect target before following it.
 */
export const IsJWKSURLValid = async (url: string): Promise<boolean> => {
  try {
    let current = url;

    for (let hop = 0; hop <= JWKS_MAX_REDIRECTS; hop++) {
      await assertSafeJwksUrl(current);

      const response = await fetchWithTimeout(current, {
        timeout: 2000,
        redirect: 'manual',
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (response.status >= 300 && response.status < 400) {
        assert.strictEqual(
          hop < JWKS_MAX_REDIRECTS,
          true,
          'JWKS Url exceeded redirect limit'
        );
        const location = response.headers.get('location');
        assert.strictEqual(
          Boolean(location),
          true,
          'JWKS redirect missing Location header'
        );
        current = new URL(location as string, current).toString();
        continue;
      }

      assert.strictEqual(response.ok, true, 'Failed to get JWKS document');
      await response.json();
      return true;
    }

    return false;
  } catch (ex) {
    logger.debug('[ValidateJWKSURL] Failed %s', ex);
    return false;
  }
};
