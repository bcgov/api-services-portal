import { Type } from '@sinclair/typebox';
import type {
  FastifyPluginAsyncTypebox,
  TLiteral,
  TUnion,
} from '@fastify/type-provider-typebox';

import {
  ApplyPatternRequest,
  ApplyResourcesResponse,
} from '../schemas/resources.js';

const security = [] as any[];

export const registerPatternsRoutes: FastifyPluginAsyncTypebox = async (
  app
) => {
  app.post(
    '/patterns/:name',
    {
      schema: {
        tags: ['Resource Provisioning'],
        summary: 'Evaluate gateway pattern',
        operationId: 'applyPattern',
        description:
          'Evaluates the named SDX pattern against the supplied ' +
          'parameters, then dispatches the resources it produces to the ' +
          'providers that own each kind. Returns the per-provider apply ' +
          'outcomes.',
        security,
        params: Type.Object({
          name: Type.String({
            description: 'Pattern identifier to evaluate.',
            examples: ['sdx-p2p-consumer.r1'],
          }),
        }),
        querystring: Type.Object({
          action: Type.Union(
            [
              Type.Literal('preview', {
                description: 'Evaluate the pattern without applying resources.',
              }),
              Type.Literal('apply'),
              Type.Literal('diff'),
              Type.Literal('delete'),
            ],
            {
              description:
                'The action to perform on the generated resources (preview, apply, diff, delete).',
            }
          ),
        }),
        body: Type.Ref(ApplyPatternRequest),
        response: { 200: Type.Ref(ApplyResourcesResponse) },
      },
    },
    async (req) =>
      app.controllers.patterns.process({
        pattern: req.params.name,
        parameters: req.body.parameters,
        action: req.query.action,
      })
  );
};
