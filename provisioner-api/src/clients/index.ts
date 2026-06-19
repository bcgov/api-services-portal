import type { FastifyBaseLogger } from 'fastify';
import {
  createClientSecretClient,
  createSignedJwtClient,
  createUnconfiguredClient,
  type OAuthClient,
} from './oauth.js';
import { loadClientSecretConfig, loadSignedJwtConfig } from './config.js';
import { FeedApiClient } from './feed/index.js';

export interface Clients {
  aps: OAuthClient;
  sdx: OAuthClient;
  gwa: OAuthClient;
  css: OAuthClient;
  feed: FeedApiClient;
}

function childLogger(
  parent: FastifyBaseLogger | undefined,
  name: string
): FastifyBaseLogger | undefined {
  return parent?.child({ component: 'oauth-client', client: name });
}

function buildJwtClient(
  name: string,
  prefix: string,
  parent: FastifyBaseLogger | undefined
): OAuthClient {
  const result = loadSignedJwtConfig(name, prefix);
  if (!result.ok) {
    return createUnconfiguredClient(
      name,
      `missing ${result.missing.join(', ')}`
    );
  }
  return createSignedJwtClient({
    ...result.config,
    logger: childLogger(parent, name),
  });
}

function buildSecretClient(
  name: string,
  prefix: string,
  parent: FastifyBaseLogger | undefined
): OAuthClient {
  const result = loadClientSecretConfig(name, prefix);
  if (!result.ok) {
    return createUnconfiguredClient(
      name,
      `missing ${result.missing.join(', ')}`
    );
  }
  return createClientSecretClient({
    ...result.config,
    logger: childLogger(parent, name),
  });
}

export function buildClients(logger?: FastifyBaseLogger): Clients {
  return {
    aps: buildJwtClient('aps', 'APS', logger),
    sdx: buildJwtClient('sdx', 'SDX', logger),
    gwa: buildJwtClient('gwa', 'GWA', logger),
    css: buildSecretClient('css', 'CSS', logger),
    feed: new FeedApiClient(process.env.FEED_URL, logger),
  };
}
