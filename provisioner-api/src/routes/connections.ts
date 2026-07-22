import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import {
  ConnectionChangeRequest,
  ConnectionChangeResponse,
} from '../schemas/resources.js';

const security = [{ jwt: [] }];

export const registerResourcesRoutes: FastifyPluginAsyncTypebox = async (
  app
) => {
  app.post(
    '/connections/:id',
    {
      schema: {
        tags: ['Resource Provisioning'],
        summary: 'Evaluate connection request',
        operationId: 'connectionChange',
        description:
          'Evaluate the SDX patterns relevant to the connection request and dispatch them to the providers that own each kind. Returns the per-provider apply outcomes.',
        security,
        body: Type.Ref(ConnectionChangeRequest),
        params: Type.Object({
          id: Type.String({
            description: 'Connection request identifier to evaluate.',
            examples: ['10'],
          }),
        }),
        querystring: Type.Object({
          action: Type.Union(
            [
              Type.Literal('preview'),
              Type.Literal('diff'),
              Type.Literal('apply'),
              Type.Literal('delete'),
            ],
            {
              description:
                'The action to perform on the generated resources (preview, diff, apply).',
            }
          ),
        }),

        response: { 200: Type.Ref(ConnectionChangeResponse) },
      },
    },
    async (req) =>
      app.controllers.connections.onConnectionRequestChange(
        req.params.id,
        req.body,
        req.query.action
      )
  );
};
