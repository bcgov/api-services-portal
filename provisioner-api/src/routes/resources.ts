import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import {
  ApplyResourcesRequest,
  ApplyResourcesResponse,
  ConnectionChangeRequest,
  ConnectionChangeResponse,
} from '../schemas/resources.js';

const security = [{ jwt: [] }];

export const registerResourcesRoutes: FastifyPluginAsyncTypebox = async (
  app
) => {
  app.post(
    '/resources/connection-change',
    {
      schema: {
        tags: ['Resources'],
        summary: 'Apply a connection change',
        operationId: 'connectionChange',
        description:
          'Applies a connection change (create or update) using the same ' +
          'input as the SDX Member create-connection operation. The owning ' +
          'organization is resolved from the service catalog and the change ' +
          'is forwarded to SDX.',
        security,
        body: Type.Ref(ConnectionChangeRequest),
        querystring: Type.Object({
          action: Type.Union([Type.Literal('preview'), Type.Literal('apply')], {
            description: 'The type of connection change to apply.',
          }),
        }),
        response: { 200: Type.Ref(ConnectionChangeResponse) },
      },
    },
    async (req) =>
      app.controllers.resource.onConnectionRequestChange(
        req.body,
        req.query.action
      )
  );
};
