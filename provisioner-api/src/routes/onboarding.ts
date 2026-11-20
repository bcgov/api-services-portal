import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { NewIntegrationAccessRequestResponse } from '../schemas/sdx.js';

const INTEGRATION_ID_DESC =
  'Identifier of the integration whose held access request should be submitted.';

export const registerOnboardingRoutes: FastifyPluginAsyncTypebox = async (
  app
) => {
  app.post(
    '/integrations/:integrationId/onboarding/complete',
    {
      schema: {
        tags: ['Onboarding'],
        summary: 'Complete held onboarding',
        operationId: 'completeIntegrationOnboarding',
        description:
          'Internal operator call. Replays a held Common SSO access request after the integration is linked to a subsystem, then marks the onboarding task processed. Returns the stored submission when onboarding was already completed.',
        security: [],
        params: Type.Object({
          integrationId: Type.String({
            description: INTEGRATION_ID_DESC,
            examples: ['claims'],
          }),
        }),
        response: { 200: Type.Ref(NewIntegrationAccessRequestResponse) },
      },
    },
    async (req) =>
      app.controllers.integration.completeIntegrationOnboarding({
        integrationId: req.params.integrationId,
      })
  );
};
