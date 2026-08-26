import type { FastifyBaseLogger } from 'fastify';
import {
  createSignedJwtClient,
  createUnconfiguredClient,
  type OAuthClient,
} from './oauth.js';
import {
  loadGwaEnvJwtConfig,
  loadSignedJwtConfig,
} from './config.js';
import { FeedApiClient } from './feed/index.js';
import { SdxOperatorApiClient } from './sdx-operator/index.js';
import { CaTokenApiClient } from './ca-token/index.js';
import {
  loadEnvironments,
  type EnvironmentsConfig,
} from '../config/environments.js';

/**
 * Resolves the GWA OAuth client for a given environment. The GWA OAuth client
 * differs per environment (each has its own token endpoint and client id), so
 * it is resolved on demand rather than being a single shared instance.
 */
export type GatewayClientResolver = (environment: string) => OAuthClient;

export interface Clients {
  aps: OAuthClient;
  sdx: OAuthClient;
  gwa: GatewayClientResolver;
  css: OAuthClient;
  feed: FeedApiClient;
  sdxOperator: SdxOperatorApiClient;
  caToken: CaTokenApiClient;
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

/**
 * Builds a resolver that lazily creates (and caches) one GWA OAuth client per
 * environment from the environments config. Environments absent from the
 * config, or missing required fields, yield an unconfigured client whose calls
 * throw a descriptive error.
 */
function buildGwaClientResolver(
  environments: EnvironmentsConfig,
  parent: FastifyBaseLogger | undefined
): GatewayClientResolver {
  const cache = new Map<string, OAuthClient>();
  return (environment: string): OAuthClient => {
    let client = cache.get(environment);
    if (!client) {
      const name = `gwa:${environment}`;
      const result = loadGwaEnvJwtConfig(environment, environments[environment]);
      client = result.ok
        ? createSignedJwtClient({
            ...result.config,
            logger: childLogger(parent, name),
          })
        : createUnconfiguredClient(
            name,
            `missing ${result.missing.join(', ')}`
          );
      cache.set(environment, client);
    }
    return client;
  };
}

export function buildClients(logger?: FastifyBaseLogger): Clients {
  const environments = loadEnvironments();
  return {
    aps: buildJwtClient('aps', 'APS', logger),
    sdx: buildJwtClient('sdx', 'SDX', logger),
    gwa: buildGwaClientResolver(environments, logger),
    css: buildJwtClient('css', 'CSS', logger),
    feed: new FeedApiClient(process.env.FEED_URL, logger),
    sdxOperator: new SdxOperatorApiClient(environments, logger),
    caToken: new CaTokenApiClient(environments, logger),
  };
}
