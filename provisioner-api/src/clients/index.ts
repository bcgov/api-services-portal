import {
  createClientSecretClient,
  createSignedJwtClient,
  createUnconfiguredClient,
  type OAuthClient,
} from './oauth.js';
import { loadClientSecretConfig, loadSignedJwtConfig } from './config.js';

export interface Clients {
  aps: OAuthClient;
  sdx: OAuthClient;
  gwa: OAuthClient;
  css: OAuthClient;
}

function buildJwtClient(name: string, prefix: string): OAuthClient {
  const result = loadSignedJwtConfig(name, prefix);
  if (!result.ok) {
    return createUnconfiguredClient(
      name,
      `missing ${result.missing.join(', ')}`
    );
  }
  return createSignedJwtClient(result.config);
}

function buildSecretClient(name: string, prefix: string): OAuthClient {
  const result = loadClientSecretConfig(name, prefix);
  if (!result.ok) {
    return createUnconfiguredClient(
      name,
      `missing ${result.missing.join(', ')}`
    );
  }
  return createClientSecretClient(result.config);
}

export function buildClients(): Clients {
  return {
    aps: buildJwtClient('aps', 'APS'),
    sdx: buildJwtClient('sdx', 'SDX'),
    gwa: buildJwtClient('gwa', 'GWA'),
    css: buildSecretClient('css', 'CSS'),
  };
}
