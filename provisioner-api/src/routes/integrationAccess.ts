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

export const registerIntegrationAccessRoutes: FastifyPluginAsyncTypebox =
  async (app) => {
    app.get(
      '/subsystems/:id/allowed-services',
      {
        schema: {
          tags: ['Integration Access'],
          summary: 'List allowed access',
          operationId: 'getSubsystemAllowedServices',
          description:
            'Returns the integration access requests with approved access to SDX services.',
          security,
          params: Type.Object({
            id: Type.String({
              description: SUBSYSTEM_ID_DESC,
              examples: ['claims'],
            }),
          }),
          querystring: Type.Object({
            integrationId: Type.Optional(
              Type.String({
                description: INTEGRATION_ID_DESC,
                examples: ['integration-42'],
              })
            ),
          }),
          response: { 200: AllowedServicesResponse },
        },
      },
      async (req) =>
        app.controllers.subsystem.getSubsystemAllowedServices({
          subsystemId: req.params.id,
          integrationId: req.query.integrationId,
        })
    );

    app.post(
      '/subsystems/:id/access-requests',
      {
        schema: {
          tags: ['Integration Access'],
          summary: 'New access request',
          operationId: 'createSubsystemAccessRequest',
          description:
            'Submits a new integration access request for a partner authorization integration for the SDX subsystem. Approval triggers the `provisionAllowedServices` callback to the partner.',
          security,
          params: Type.Object({
            id: Type.String({
              description: SUBSYSTEM_ID_DESC,
              examples: ['claims'],
            }),
          }),
          body: Type.Ref(NewIntegrationAccessRequest),
          response: { 200: Type.Ref(NewIntegrationAccessRequestResponse) },
          callbacks: {
            provisionAllowedServices: {
              '/integrations/{$request.body#/integrationId}/allowed-services': {
                put: {
                  requestBody: {
                    required: true,
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/IntegrationAccessRequest',
                        },
                      },
                    },
                  },
                  responses: {
                    '200': {
                      description:
                        'Partner acknowledged receipt of the provisioning instruction.',
                    },
                  },
                },
              },
            },
          },
        },
      },
      async (req) =>
        app.controllers.subsystem.createSubsystemAccessRequest({
          subsystemId: req.params.id,
          request: req.body,
        })
    );
  };
