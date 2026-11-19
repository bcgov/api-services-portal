import { createHash } from 'node:crypto';
import type {
  SdxMemberApiClient,
  ServiceCatalogEntry,
  SubsystemEntry,
} from '../../clients/sdx-member/index.js';
import { loadEnvironments } from '../../config/environments.js';
import { BadRequestError, InternalError } from '../../errors/api-errors.js';
import {
  getRoutePathPrefix,
  type EnrichedServiceCatalogEntry,
} from './utils.js';
import {
  providerUpgradePlugins,
  type ProviderUpgrades,
} from './sdx-p2p-provider.js';

import type { PatternProcessor } from '../patterns-evaluator.js';

type PublisherData = AsyncRouteData & {
  webhook?: { topic: string; url: string };
};

export function publisherWebhook(
  inputs: AsyncConnectionInputs,
  webhook?: PublisherData['webhook']
) {
  return {
    kind: 'PubSubWebhook',
    name: `sdx-${connectionKey(inputs)}`,
    topic: webhook?.topic,
    webhookUrl: webhook?.url,
  };
}

export class SDXAsyncPublisherPattern implements PatternProcessor {
  constructor(private readonly api: SdxMemberApiClient) {}

  static ID = 'sdx-async-publisher.r1';
  id = () => SDXAsyncPublisherPattern.ID;
  requiredParams = () => connectionParams;
  deleteHandling = () => 'delete' as const;

  async inject(
    inputs: AsyncConnectionInputs,
    context?: { action?: string }
  ): Promise<PublisherData> {
    const service = await catalogService(this.api, inputs);
    const owner = service.subsystem;
    const gatewayId = gatewayFor(owner);
    if (context?.action === 'delete') return { gatewayId };

    const topic = requireTopic(inputs.topic);
    const scope = publishedEventScope(
      await this.api.getOASServiceSpec(inputs.serviceId),
      topic
    );
    const runtime = await runtimeFor(this.api, owner, service.environment);
    const bridgeUrl =
      loadEnvironments()[service.environment]?.ape_pubsub_kafka_url;
    if (!bridgeUrl)
      throw new InternalError('APE pubsub-kafka URL must be configured');
    const url = `${bridgeUrl.replace(/\/$/, '')}/${topic}/events`;
    const subscriber = await this.api.getCatalogSubsystem(inputs.clientId);
    gatewayFor(subscriber);
    const subscriberRuntime = await runtimeFor(
      this.api,
      subscriber,
      service.environment
    );
    return {
      gatewayId,
      webhook: {
        topic,
        url: `https://${subscriberRuntime.host}${routePath(inputs, 'subscriber')}`,
      },
      route: routeConnection(
        inputs,
        service,
        owner,
        runtime,
        runtime,
        url,
        scope
      ),
    };
  }

  eval(inputs: AsyncConnectionInputs, data: PublisherData) {
    const routes = buildAsyncRoute(inputs, data, 'producer', {
      mtlsAuth: {},
      mtlsAcl: {},
    });
    const webhook = publisherWebhook(inputs, data.webhook);
    return data.route ? [...routes, webhook] : [webhook, ...routes];
  }
}

export const connectionParams = ['connId', 'clientId', 'serviceId'];

export type AsyncConnectionInputs = {
  connId: string;
  clientId: string;
  serviceId: string;
  environment?: string;
  topic?: string;
  upgrades?: Partial<ProviderUpgrades>;
  upstreamUrl?: string;
};

type Runtime = Awaited<ReturnType<typeof runtimeFor>>;
type RouteConnection = {
  url: string;
  scope?: string;
  issuers: string[];
  audience: string;
  service: EnrichedServiceCatalogEntry;
  runtime: Runtime;
  peerRuntime: Runtime;
};
export type AsyncRouteData = { gatewayId: string; route?: RouteConnection };

export async function catalogService(
  api: SdxMemberApiClient,
  inputs: AsyncConnectionInputs
) {
  const service = await api.getOASService(inputs.serviceId);
  if (inputs.environment && inputs.environment !== service.environment) {
    throw new BadRequestError(
      'AsyncAPI pattern environment must match the service'
    );
  }
  return service;
}

export function gatewayFor(owner: SubsystemEntry) {
  if (!owner.gateway?.id || !owner.organization) {
    throw new BadRequestError(
      'AsyncAPI endpoint owner has no gateway or organization'
    );
  }
  return owner.gateway.id;
}

export async function runtimeFor(
  api: SdxMemberApiClient,
  owner: SubsystemEntry,
  environment: string
) {
  if (!owner.organization)
    throw new BadRequestError('AsyncAPI runtime owner has no organization');
  const subsystem = await api.getSubsystemClient(
    owner.organization.name,
    owner.name
  );
  const runtime = subsystem.runtimeGroups?.find(
    (group) => group.environment === environment
  );
  if (!runtime?.host)
    throw new BadRequestError('AsyncAPI endpoint runtime group is missing');
  return runtime;
}

export function routeConnection(
  inputs: AsyncConnectionInputs,
  service: ServiceCatalogEntry,
  owner: SubsystemEntry,
  runtime: Runtime,
  peerRuntime: Runtime,
  url: string,
  scope?: string
): RouteConnection {
  const config = loadEnvironments()[service.environment];
  const issuers = config?.sdx_trusted_issuers;
  const audience = config?.ape_event_token_audience;
  if (!issuers?.length || !audience) {
    throw new InternalError(
      'APE event token audience and trusted issuers must be configured'
    );
  }
  if (inputs.upgrades?.counterSign && !owner.member) {
    throw new BadRequestError(
      'Counter-signing requires an endpoint owner member'
    );
  }
  return {
    url,
    scope,
    issuers,
    audience,
    runtime,
    peerRuntime,
    service: {
      ...service,
      subsystem: { ...service.subsystem, member: owner.member },
    } as EnrichedServiceCatalogEntry,
  };
}

type RouteRole = 'producer' | 'subscriber';

export function buildAsyncRoute(
  inputs: AsyncConnectionInputs,
  data: AsyncRouteData,
  role: RouteRole,
  defaults: Partial<ProviderUpgrades> = {},
  verifyUpstreamTls = false
) {
  const key = connectionKey(inputs);
  const name = `sdx.asyncapi.${key}.${role}`;
  const tags = [`ns.${data.gatewayId}.${key}.${role}`, 'sdx'];
  const service = { kind: 'GatewayService', name, tags };
  const { route } = data;
  if (!route) return [service];

  const configured = inputs.upgrades ?? {};
  const upgrades = {
    ...defaults,
    ...configured,
    token: {
      allowedAud: route.audience,
      allowedIss: route.issuers,
      scope: route.scope,
      ...configured.token,
    },
  } as ProviderUpgrades;
  const plugins = providerUpgradePlugins(
    tags,
    {
      service: route.service,
      serviceRG: route.runtime,
      clientRG: route.peerRuntime,
    },
    { upgrades }
  ).map((plugin) =>
    plugin.name === 'jwt-keycloak'
      ? { ...plugin, config: { ...plugin.config, claims_to_verify: ['exp'] } }
      : plugin
  );
  return [
    {
      ...service,
      url: route.url,
      retries: 0,
      ...(verifyUpstreamTls && { tls_verify: true }),
      routes: [
        {
          name: `${name}.POST`,
          tags,
          hosts: [route.runtime.host],
          snis: [route.runtime.host],
          paths: [
            `~^${routePath(inputs, role).replace(/[.*+?^$${}()|[\]\\]/g, '\\$&')}$`,
          ],
          methods: ['POST'],
          protocols: ['https'],
          strip_path: true,
        },
      ],
      plugins,
    },
  ];
}

function routePath(inputs: AsyncConnectionInputs, role: RouteRole) {
  return `/${getRoutePathPrefix(inputs.serviceId)}/asyncapi/${connectionKey(inputs)}/${role}`;
}

function connectionKey(inputs: AsyncConnectionInputs) {
  return createHash('sha256')
    .update(JSON.stringify([inputs.connId, inputs.clientId, inputs.serviceId]))
    .digest('hex')
    .slice(0, 32);
}

export function requireTopic(topic: unknown): string {
  if (
    typeof topic !== 'string' ||
    !/^[a-zA-Z0-9._-]{1,249}$/.test(topic) ||
    topic === '.' ||
    topic === '..'
  ) {
    throw new BadRequestError('A valid Kafka topic is required');
  }
  return topic;
}

// Resolve only definitions published in the producer's catalog document.
export function publishedEventScope(
  spec: unknown,
  topic?: string
): string | undefined {
  const document = asRecord(spec);
  const resolve = (value: unknown) => {
    const ref = asRecord(value)?.$ref;
    if (typeof ref !== 'string') return asRecord(value);
    if (!ref.startsWith('#/')) return undefined;
    return asRecord(
      ref
        .slice(2)
        .split('/')
        .reduce<unknown>((target, part) => {
          const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
          const record = asRecord(target);
          return record && Object.hasOwn(record, key) ? record[key] : undefined;
        }, document)
    );
  };
  const operations =
    typeof document?.asyncapi === 'string' && document.asyncapi.startsWith('3.')
      ? Object.values(asRecord(document.operations) ?? {})
          .map(resolve)
          .filter((operation) => {
            const channel = resolve(operation?.channel);
            if (
              operation?.action !== 'send' ||
              !channel ||
              (topic !== undefined && channel.address !== topic)
            )
              return false;
            const servers = Array.isArray(channel.servers)
              ? channel.servers
              : Object.values(asRecord(document.servers) ?? {});
            return servers.some((server) => {
              const protocol = resolve(server)?.protocol;
              return protocol === 'kafka' || protocol === 'kafka-secure';
            });
          })
      : [];
  if (!operations.length) {
    throw new BadRequestError(
      'The producer AsyncAPI spec must declare the requested Kafka topic'
    );
  }
  const operationScopes = operations.map((operation) => {
    const schemes = Array.isArray(operation?.security)
      ? operation.security.map(resolve)
      : [];
    return schemes.length === 1 &&
      schemes[0]?.type === 'oauth2' &&
      Array.isArray(schemes[0].scopes) &&
      schemes[0].scopes.length === 1
      ? schemes[0].scopes[0]
      : undefined;
  });
  const [scope] = operationScopes;
  return typeof scope === 'string' &&
    operationScopes.every((item) => item === scope)
    ? scope
    : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}
