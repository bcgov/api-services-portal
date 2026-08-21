import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { GatewayResourcesResponse } from '../schemas/resources.js';

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
};
