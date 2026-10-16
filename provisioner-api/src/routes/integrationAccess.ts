import { Type } from '@sinclair/typebox';
import { partnerErrors } from '../openapi/partner-errors.js';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import {
  IntegrationAccessRequest,
  IntegrationStatus,
  NewIntegrationAccessRequest,
  NewIntegrationAccessRequestResponse,
} from '../schemas/sdx.js';

const ENVIRONMENT_DESC =
  'Target environment (for example `dev`, `test`, or `prod`) the subsystems are scoped to.';
const CLIENT_ID_DESC = 'Identifier of the OAuth Integration Client ID';
const STATUS_DESC =
  'Filters the returned services to those with the given access status.';

const INTEGRATION_ID_DESC =
  'Identifier of the integration that allowed-services should be filtered or provisioned for.';

const AllowedServicesResponse = Type.Ref(IntegrationAccessRequest, {
  description:
    'Allowed-service grants currently provisioned for the subsystem.',
  examples: [
    {
      submissionId: '9f3c2f3a-1c1e-4c79-8e34-9f6f2b6b9d8a',
      integrationId: 'integration-42',
      clientId: 'integration-42',
      resourceServers: [
        {
          id: 'claims',
          environment: 'dev',
          services: [
            { scopes: ['Claims.Read'], name: 'claims-svc', version: '1.0.0' },
          ],
        },
      ],
    },
  ],
});

const security = [{ jwt: [] }];

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
            'Returns whether an integration is registered as an SDX subsystem, and its subsystem attributes if so. Unknown integrations return 200 with status unregistered.',
          security,
          params: Type.Object({
            integrationId: Type.String({
              description: CLIENT_ID_DESC,
              examples: ['claims'],
            }),
          }),
          response: {
            200: Type.Ref(IntegrationStatus),
            ...partnerErrors(400, 401, 403, 500, 502),
          },
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
            'Returns integration access filtered by environment and approval status. Unknown integrations or invalid query values return 400; no matching connections return 404; conflicting connection identity or scopes no longer declared by the catalog return 409. Upstream failures return 502. Approved versions remain pinned to the reviewed version.',
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

          response: {
            200: AllowedServicesResponse,
            ...partnerErrors(400, 401, 403, 404, 409, 500, 502),
          },
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
            'Validates all requested services, environments, optional catalog versions and scopes before creating or updating access requests. Invalid or stale request values return 400; missing integration/organization returns 404; conflicting existing connections return 409; SDX catalog failures (including removed services) return 502. Version or scope changes require re-approval. Approval triggers the `provisionAllowedServices` callback to the partner.',
          security,
          params: Type.Object({
            integrationId: Type.String({
              description: INTEGRATION_ID_DESC,
              examples: ['claims'],
            }),
          }),
          body: Type.Ref(NewIntegrationAccessRequest),
          response: {
            200: Type.Ref(NewIntegrationAccessRequestResponse),
            ...partnerErrors(400, 401, 403, 404, 409, 500, 502),
          },
          callbacks: {
            provisionAllowedServices: {
              '/requests/{$request.params#/integrationId}/sdx-allowed-access': {
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
                    '2XX': {
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
