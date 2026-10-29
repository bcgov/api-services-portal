import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import {
  GatewayResourcesResponse,
  GatewayKeysResponse,
  DeleteGatewayResponse,
} from '../schemas/resources.js';

const GATEWAY_ID_DESC =
  'Identifier of the gateway (namespace) the request is scoped to.';
const ENVIRONMENT_DESC =
  'Target environment (for example `dev`, `test`, or `prod`) whose GWA endpoint the request is routed to.';

const security = [] as any[];

export const registerGatewaysRoutes: FastifyPluginAsyncTypebox = async (
  app
) => {
  app.get(
    '/gateways/:gateway/resources',
    {
      schema: {
        tags: ['Gateways'],
        summary: 'List gateway resources',
        operationId: 'getGatewayResources',
        description:
          'Returns the tagged gateway entities (services, routes, plugins, etc.) belonging to the gateway.',
        security,
        params: Type.Object({
          gateway: Type.String({
            description: GATEWAY_ID_DESC,
            examples: ['platform'],
          }),
        }),
        querystring: Type.Object({
          environment: Type.Optional(
            Type.String({
              description: ENVIRONMENT_DESC,
              examples: ['dev'],
            })
          ),
          tag: Type.Optional(
            Type.String({
              description:
                'Optional tag to filter the returned gateway entities by.',
              examples: ['ns.platform'],
            })
          ),
        }),
        response: { 200: GatewayResourcesResponse },
      },
    },
    async (req) =>
      app.controllers.gateway.getResources({
        gatewayId: req.params.gateway,
        environment: req.query.environment,
        tag: req.query.tag,
      })
  );

  app.delete(
    '/gateways/:gateway',
    {
      schema: {
        tags: ['Gateways'],
        summary: 'Delete gateway',
        operationId: 'deleteGateway',
        description:
          'Tears down an SDX gateway: removes its Portal record, UMA resource and namespace group. ' +
          'Refused with 409 while the gateway still has configuration in any environment.',
        security,
        params: Type.Object({
          gateway: Type.String({
            description: GATEWAY_ID_DESC,
            examples: ['sdx-gw-abc12'],
          }),
        }),
        response: { 200: Type.Ref(DeleteGatewayResponse) },
      },
    },
    async (req) =>
      app.controllers.gateway.deleteGateway({
        gatewayId: req.params.gateway,
      })
  );

  app.get(
    '/gateways/:gateway/keys',
    {
      schema: {
        tags: ['Gateways'],
        summary: 'List gateway keys',
        operationId: 'getGatewayKeys',
        description:
          'Returns Kong keys and key sets for the gateway. Private key material is never returned.',
        security,
        params: Type.Object({
          gateway: Type.String({
            description: GATEWAY_ID_DESC,
            examples: ['platform'],
          }),
        }),
        querystring: Type.Object({
          environment: Type.String({
            description: ENVIRONMENT_DESC,
            examples: ['dev'],
          }),
          tag: Type.Optional(
            Type.String({
              description:
                'Optional qualifier tag (must start with ns.{gateway}).',
              examples: ['ns.platform.key-rg-dev'],
            })
          ),
          keySet: Type.Optional(
            Type.String({
              description: 'Optional Kong key-set name filter.',
              examples: ['sdx.edge.myrg.dev'],
            })
          ),
        }),
        response: { 200: Type.Ref(GatewayKeysResponse) },
      },
    },
    async (req) =>
      app.controllers.gateway.getKeys({
        gatewayId: req.params.gateway,
        environment: req.query.environment,
        tag: req.query.tag,
        keySet: req.query.keySet,
      })
  );
};
