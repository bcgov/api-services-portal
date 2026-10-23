import { Type } from '@sinclair/typebox';
import { partnerErrors } from '../openapi/partner-errors.js';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { SubsystemEnvironment } from '../schemas/sdx.js';

const ENVIRONMENT_DESC =
  'Target environment (for example `dev`, `test`, or `prod`) the resource servers are scoped to.';
const ResourceServersListResponse = Type.Array(Type.Ref(SubsystemEnvironment), {
  description:
    'Collection of resource server environments visible to the calling partner service.',
  examples: [
    [
      {
        id: 'claims',
        name: 'Claims',
        organization: 'ministry-of-health',
        environment: 'dev',
        description: 'Authoritative source for benefit claim records.',
        services: [
          {
            summary: 'Read-only access to claim data.',
            scopes: [
              { label: 'Claims.Read', description: 'Read claim records' },
            ],
            title: 'Claims Service',
            name: 'claims-svc',
            version: '1.0.0',
          },
        ],
      },
    ],
  ],
});

const security = [{ jwt: [] }];

export const registerResourceServersRoutes: FastifyPluginAsyncTypebox = async (
  app
) => {
  app.get(
    '/resource-servers',
    {
      schema: {
        tags: ['Resource Servers'],
        summary: 'List resource servers',
        operationId: 'getResourceServers',
        description:
          'Returns SDX resource servers filtered by the required environment. An environment with no matching services returns an empty list. Missing environment returns 400; upstream catalog failures return 502.',
        security,
        querystring: Type.Object({
          environment: Type.String({
            minLength: 1,
            description: ENVIRONMENT_DESC,
            examples: ['dev'],
          }),
        }),
        response: {
          200: ResourceServersListResponse,
          ...partnerErrors(400, 401, 403, 500, 502),
        },
      },
    },
    async (req) =>
      app.controllers.resourceServer.getResourceServers({
        environment: req.query.environment,
      })
  );
};
