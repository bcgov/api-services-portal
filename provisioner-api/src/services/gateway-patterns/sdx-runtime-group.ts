import { FastifyBaseLogger } from 'fastify/types/logger.js';
import type { SdxMemberApiClient } from '../../clients/sdx-member/index.js';
import type { RuntimeGroup } from '../../clients/sdx-member/index.js';
import { PatternProcessor } from '../patterns-evaluator.js';
import { assert } from './utils.js';
import { loadEnvironments } from '../../config/environments.js';
import { BadGatewayError, withDetails } from '../../errors/api-errors.js';

export interface SDXRuntimeGroupPatternConfig {
  organization: string;
  runtimeGroupName: string;
  environment: string;
}

interface SDXRuntimeGroupPatternData {
  gatewayId: string;
  runtimeGroup: RuntimeGroup;
}

/**
 * This pattern will provision the default route policies for an Edge Server
 *
 */
export class SDXRuntimeGroupPattern implements PatternProcessor {
  static ID = 'sdx-runtime-group.r1';
  static requiredParams = ['organization', 'runtimeGroupName', 'environment'];

  constructor(
    private readonly api: SdxMemberApiClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  id = () => SDXRuntimeGroupPattern.ID;
  requiredParams = () => SDXRuntimeGroupPattern.requiredParams;
  deleteHandling = () => 'delete' as const;

  async inject(
    inputs: SDXRuntimeGroupPatternConfig
  ): Promise<SDXRuntimeGroupPatternData> {
    const { api } = this;

    // retrieve the runtime groups owned by the organization
    const owned = await api.listRuntimeGroups(inputs.organization, {
      filter: 'owned',
    });
    const rg = owned.find(
      (g) =>
        g.name === inputs.runtimeGroupName &&
        g.environment === inputs.environment
    );

    assert.strictEqual(
      Boolean(rg),
      true,
      'Organization does not own this runtime group environment'
    );

    return {
      gatewayId: rg!.gatewayId!,
      runtimeGroup: rg!,
    };
  }

  eval(inputs: SDXRuntimeGroupPatternConfig, data: SDXRuntimeGroupPatternData) {
    const gw = data.gatewayId;
    const nm = `sdx.rg.${inputs.runtimeGroupName}.${inputs.environment}`;
    const nsQualifier = `rg-${inputs.runtimeGroupName}-${inputs.environment}`;

    const runtimeGroupName = inputs.runtimeGroupName;
    const routeHost = data.runtimeGroup.host!;

    const consumerUrl = new URL(data.runtimeGroup.consumerEndpoint!);
    const consumerHost = consumerUrl.hostname;

    const operatorEdgeUrl = loadEnvironments()[inputs.environment]
      ?.operator_edge_url;
    if (!operatorEdgeUrl) {
      throw withDetails(
        new BadGatewayError(
          `SDX Operator edge server is not configured for environment '${inputs.environment}'`
        ),
        { environment: inputs.environment, missing: 'operator_edge_url' }
      );
    }
    const routeHostUrl = new URL(operatorEdgeUrl);

    let tags = [`ns.${gw}.${nsQualifier}`, 'sdx'];

    return [
      //
      // DENY ALL ROUTES BY DEFAULT (Internal and External)
      //
      {
        kind: 'GatewayService',
        name: `${nm}.DENY`,
        tags,
        url: 'https://10.0.0.1', // dummy URL
        routes: [
          {
            name: `${nm}.DENY`,
            tags,
            hosts: [routeHost],
            snis: [routeHost],
            paths: ['/'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            protocols: ['https'],
          },
          {
            name: `${nm}.DENY-INT`,
            tags,
            hosts: [`internal.${routeHost}`, consumerHost],
            paths: ['/'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            protocols: ['http'],
          },
        ],
        plugins: [
          {
            name: 'request-termination',
            tags,
            config: {
              status_code: 401,
              message: 'Access Denied. Route not found.',
            },
          },
        ],
      },

      //
      // SIMPLE internal "/hello" endpoint (INTERNAL USE ONLY)
      //
      {
        kind: 'GatewayService',
        name: `${nm}.HELLO`,
        url: 'https://10.0.0.1', // dummy URL
        tags,
        tls_verify: false,
        routes: [
          {
            name: `${nm}.HELLO`,
            tags,
            hosts: [`internal.${routeHost}`, consumerHost],
            paths: ['/hello'],
            methods: ['GET'],
            protocols: ['http'],
          },
        ],
        plugins: [
          {
            name: 'request-termination',
            tags,
            config: {
              status_code: 200,
              content_type: 'application/json',
              body: JSON.stringify({
                message:
                  'hello from the internal endpoint of a CSBC Edge Server',
                runtimeGroup: runtimeGroupName,
              }),
            },
          },
        ],
      },

      //
      // Trust Registry for Public Keys
      //
      {
        kind: 'GatewayService',
        name: `${nm}.JWKS`,
        url: 'https://10.0.0.1', // dummy URL
        tags,
        tls_verify: false,
        routes: [
          {
            name: `${nm}.JWKS`,
            tags,
            hosts: [consumerHost],
            paths: [
              '/.well-known/jwks.json',
              '~/keysets/(?<key_set>.+)/.well-known/jwks.json',
            ],
            methods: ['GET'],
            protocols: ['http', 'https'],
          },
        ],
        plugins: [
          {
            name: 'trust-registry',
            tags,
            config: {},
          },
        ],
      },

      //
      // Trust KMS key creation and CSR generation
      //
      {
        kind: 'GatewayService',
        name: `${nm}.KMS`,
        url: 'https://10.0.0.1', // dummy URL
        tags,
        tls_verify: false,
        routes: [
          {
            name: `${nm}.KMS`,
            tags,
            hosts: [routeHost],
            snis: [routeHost],
            headers: {
              'X-Client-Id': [`SDX-OPERATOR`],
            },
            paths: ['/csr'],
            methods: ['POST'],
            protocols: ['https', 'http'],
          },
        ],
        plugins: [
          {
            name: 'trust-kms',
            tags,
            config: {
              operation: 'create_key',
            },
          },
        ],
      },

      // Have a route from OPERATOR_CONSUMER_URL
      // so that the SDX internal operations from the Portal can call it
      {
        kind: 'GatewayService',
        name: `ops.c.${nm}.KMS`,
        url: `${data.runtimeGroup.sdxEndpoint}/csr`,
        tags,
        tls_verify: true,
        routes: [
          {
            name: `ops.c.${nm}.KMS`,
            paths: [`/edge/${data.runtimeGroup.name}/csr`],
            strip_path: true,
            tags,
            hosts: [routeHostUrl.hostname],
            methods: ['POST'],
            protocols: ['https', 'http'],
          },
        ],
        plugins: [...[transformer(tags, data)]],
      },
    ];
  }
}

function transformer(tags: string[], data: SDXRuntimeGroupPatternData) {
  const serviceHost = data.runtimeGroup.host;
  return {
    name: 'request-transformer',
    tags,
    config: {
      add: {
        headers: [`X-Client-Id:SDX-OPERATOR`],
      },
      replace: {
        headers: [`Host:${serviceHost}`],
      },
    },
  };
}
