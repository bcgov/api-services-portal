import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import {
  ApplyPatternRequest,
  ApplyResourcesResponse,
} from '../schemas/resources.js';

const security = [{ jwt: [] }];

export const registerPatternsRoutes: FastifyPluginAsyncTypebox = async (
  app
) => {
  app.post(
    '/patterns/:pattern',
    {
      schema: {
        tags: ['Patterns'],
        summary: 'Evaluate a gateway pattern and apply its resources',
        operationId: 'applyPattern',
        description:
          'Evaluates the named gateway pattern against the supplied ' +
          'parameters, then dispatches the resources it produces to the ' +
          'providers that own each kind. Returns the per-resource apply ' +
          'outcome.',
        security,
        params: Type.Object({
          pattern: Type.String({
            description: 'Pattern identifier to evaluate.',
            examples: ['sdx-p2p-consumer.r1'],
          }),
        }),
        querystring: Type.Object({
          action: Type.Required(
            Type.Union(
              [
                Type.Literal('preview'),
                Type.Literal('apply'),
                Type.Literal('diff'),
                Type.Literal('delete'),
              ],
              { examples: ['apply'] }
            ),
            { default: 'apply' }
          ),
        }),
        body: Type.Ref(ApplyPatternRequest),
        response: { 200: Type.Ref(ApplyResourcesResponse) },
      },
    },
    async (req) =>
      app.controllers.resource.applyPattern({
        pattern: req.params.pattern,
        parameters: req.body.parameters,
        action: req.query.action,
      })
  );
};
