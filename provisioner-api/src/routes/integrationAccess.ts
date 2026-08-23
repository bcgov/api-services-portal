import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import {
  IntegrationAccessRequest,
  IntegrationStatus,
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
const CLIENT_ID_DESC = 'Identifier of the OAuth Integration Client ID';
const STATUS_DESC =
  'Filters the returned services to those with the given access status.';

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

const AllowedServicesResponse = Type.Ref(IntegrationAccessRequest, {
  description:
    'Allowed-service grants currently provisioned for the subsystem.',
  examples: [
    {
      submissionId: '9f3c2f3a-1c1e-4c79-8e34-9f6f2b6b9d8a',
      clientId: 'integration-42',
      resourceServers: [
        {
          id: 'claims',
          environment: 'dev',
          services: [{ scopes: ['Claims.Read'], name: 'claims-svc' }],
        },
      ],
    },
  ],
});

const security = [] as any[];

export const registerIntegrationAccessRoutes: FastifyPluginAsyncTypebox =
  async (app) => {
    app.get(
      '/integrations/:integrationId',
      {
        schema: {
          tags: ['Integration Requests'],
          summary: 'Get integration status',
          operationId: 'getIntegrationStatus',
          description:
            'Returns whether an integration is registered as an SDX subsystem, and its subsystem attributes if so.',
          security,
          params: Type.Object({
            integrationId: Type.String({
              description: CLIENT_ID_DESC,
              examples: ['claims'],
            }),
          }),
          response: { 200: Type.Ref(IntegrationStatus) },
        },
      },
      async (req) =>
        app.controllers.integration.getIntegrationStatus({
          integrationId: req.params.integrationId,
        })
    );

    app.get(
      '/integrations/:integrationId/allowed-services',
      {
        schema: {
          tags: ['Integration Requests'],
          summary: 'List allowed access',
          operationId: 'getSubsystemAllowedServices',
          description:
            'Returns the details of an integration access request with approved access to SDX services.',
          security,
          params: Type.Object({
            integrationId: Type.String({
              description: CLIENT_ID_DESC,
              examples: ['claims'],
            }),
          }),
          querystring: Type.Object({
            environment: Type.String({
              description: ENVIRONMENT_DESC,
              examples: ['apsdev'],
            }),
            status: Type.Union(
              [Type.Literal('approved'), Type.Literal('pending')],
              {
                description: STATUS_DESC,
                examples: ['pending'],
              }
            ),
          }),

          response: { 200: AllowedServicesResponse },
        },
      },
      async (req) =>
        app.controllers.integration.getIntegrationAllowedServices({
          integrationClientId: req.params.integrationId,
          environment: req.query.environment,
          status: req.query.status,
        })
    );

    app.post(
      '/integrations/:integrationId/access-requests',
      {
        schema: {
          tags: ['Integration Requests'],
          summary: 'New access request',
          operationId: 'createIntegrationAccessRequest',
          description:
            'Submits a new integration access request for a partner authorization integration. Approval triggers the `provisionAllowedServices` callback to the partner.',
          security,
          params: Type.Object({
            integrationId: Type.String({
              description: INTEGRATION_ID_DESC,
              examples: ['claims'],
            }),
          }),
          body: Type.Ref(NewIntegrationAccessRequest),
          response: { 200: Type.Ref(NewIntegrationAccessRequestResponse) },
          callbacks: {
            provisionAllowedServices: {
              '/requests/{$request.params#/integrationId}/sdx-allowed-services':
                {
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
        app.controllers.integration.createIntegrationAccessRequest({
          integrationId: req.params.integrationId,
          request: req.body,
        })
    );
  };
