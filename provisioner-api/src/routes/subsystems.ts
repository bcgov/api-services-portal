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
  'When true, restricts the result to subsystems exposing resource server services only.';
const ENVIRONMENT_DESC =
  'Target environment (for example `dev`, `test`, or `prod`) the subsystems are scoped to.';
const SUBSYSTEM_ID_DESC =
  'Identifier of the subsystem the request is scoped to.';
const INTEGRATION_ID_DESC =
  'Identifier of the integration that allowed-services should be filtered or provisioned for.';

const SubsystemsListResponse = Type.Array(Type.Ref(SubsystemEnvironment), {
  description:
    'Collection of subsystem environments visible to the calling partner service.',
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
            scopes: { 'Claims.Read': 'Read claim records' },
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
    'Allowed-service grants currently provisioned for the subsystem.',
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

const security = [{ jwt: [] }];

export const registerSubsystemsRoutes: FastifyPluginAsyncTypebox = async (
  app
) => {
  app.get(
    '/subsystems',
    {
      schema: {
        tags: ['Subsystems'],
        summary: 'List subsystems',
        operationId: 'getSubsystems',
        description:
          'Returns the list of SDX subsystems, optionally filtered by subject token, service provider flag, or environment.',
        security,
        querystring: Type.Object({
          subjectToken: Type.Optional(
            Type.String({
              description: SUBJECT_TOKEN_DESC,
              examples: ['eyJhbGciOi...'],
            })
          ),
          resourceServersOnly: Type.Optional(
            Type.Boolean({
              description: RESOURCE_SERVERS_ONLY_DESC,
              examples: [true],
            })
          ),
          environment: Type.Optional(
            Type.String({
              description: ENVIRONMENT_DESC,
              examples: ['dev'],
            })
          ),
        }),
        response: { 200: SubsystemsListResponse },
      },
    },
    async (req) =>
      app.controllers.subsystem.getSubsystems({
        subjectToken: req.query.subjectToken,
        resourceServersOnly: req.query.resourceServersOnly,
        environment: req.query.environment,
      })
  );
};
