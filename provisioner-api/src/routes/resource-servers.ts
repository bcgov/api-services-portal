import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import {
  IntegrationAccessRequest,
  NewIntegrationAccessRequest,
  NewIntegrationAccessRequestResponse,
  SubsystemEnvironment,
} from '../schemas/sdx.js';

const SUBJECT_TOKEN_DESC =
  'Bearer JWT identifying the subject the partner is acting on behalf of.';
const RESOURCE_SERVERS_ONLY_DESC =
  'When true, restricts the result to resource servers exposing resource server services only.';
const ENVIRONMENT_DESC =
  'Target environment (for example `dev`, `test`, or `prod`) the resource servers are scoped to.';
const RESOURCE_SERVER_ID_DESC =
  'Identifier of the resource server the request is scoped to.';
const INTEGRATION_ID_DESC =
  'Identifier of the integration that allowed-services should be filtered or provisioned for.';

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
            description: 'Read-only access to claim data.',
            scopes: [
              { label: 'Claims.Read', description: 'Read claim records' },
            ],
            title: 'Claims Service',
            name: 'claims-svc',
          },
        ],
      },
    ],
  ],
});

const AllowedServicesResponse = Type.Array(Type.Ref(IntegrationAccessRequest), {
  description:
    'Allowed-service grants currently provisioned for the resource server.',
  examples: [
    [
      {
        submissionId: '9f3c2f3a-1c1e-4c79-8e34-9f6f2b6b9d8a',
        integrationId: 'integration-42',
        resourceServers: [
          {
            id: 'claims',
            environment: 'dev',
            services: [{ scopes: ['Claims.Read'], name: 'claims-svc' }],
          },
        ],
      },
    ],
  ],
});

const security = [] as any[];

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
          'Returns the list of SDX resource servers, filtered by environment.',
        security,
        querystring: Type.Object({
          environment: Type.Optional(
            Type.String({
              description: ENVIRONMENT_DESC,
              examples: ['dev'],
            })
          ),
        }),
        response: { 200: ResourceServersListResponse },
      },
    },
    async (req) =>
      app.controllers.resourceServer.getResourceServers({
        environment: req.query.environment,
      })
  );
};
