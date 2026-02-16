import { RuntimeGroup } from '../../../services/keystone/types';
import { RuntimeGroupService } from '../../../services/batch/runtime-group';
import assert from '../../user-assert';

export interface SDXRuntimeGroupPatternConfig extends Record<string, string> {
  organization: string;
  runtime_group_name: string;
}

interface SDXRuntimeGroupPatternData {
  gateway_id: string;
  runtime_group: RuntimeGroup;
}

/**
 * This pattern will provision the default route policies for an Edge Server
 *
 */
export const SDXRuntimeGroupPattern = {
  id: 'sdx-runtime-group.r1',
  requiredParams: ['runtime_group_name'],

  inject: async (ctx: any, inputs: Record<string, string>) => {
    // retrieve the runtime group details
    const rgService = new RuntimeGroupService();
    const rg = await rgService.findRuntimeGroupByUniqueName(
      ctx,
      inputs.runtime_group_name
    );

    assert.strictEqual(
      rg.organization.name === inputs.organization,
      true,
      'Organization does not own this runtime group'
    );

    return {
      gateway_id: rg.namespace,
      runtime_group: rg,
    };
  },

  eval: (inputs: Record<string, string>, data: SDXRuntimeGroupPatternData) => {
    const gw = data.gateway_id;
    const nm = `sdx.rg.${inputs.runtime_group_name}`;
    const nsQualifier = `rg-${inputs.runtime_group_name}`;

    const runtimeGroupName = inputs.runtime_group_name;
    const routeHost = data.runtime_group.host;

    const consumerUrl = new URL(data.runtime_group.consumerEndpoint);
    const consumerHost = consumerUrl.host;

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
            hosts: [`internal.${routeHost}`],
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
            hosts: [`internal.${routeHost}`],
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
            paths: ['/.well-known/jwks.json'],
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
    ];
  },
};
