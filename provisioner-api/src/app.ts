import Fastify, { type FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import scalarReference from '@scalar/fastify-api-reference';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import clientsPlugin from './plugins/clients.js';
import servicesPlugin from './plugins/services.js';
import controllersPlugin from './plugins/controllers.js';
import { registerSubsystemsRoutes } from './routes/subsystems.js';
import { registerResourcesRoutes } from './routes/resources.js';
import { registerPatternsRoutes } from './routes/patterns.js';
import { sdxSchemas } from './schemas/sdx.js';
import { resourceSchemas } from './schemas/resources.js';
import { ProblemSchema } from './errors/problem.js';
import {
  ERROR_RESPONSE_REFS,
  problemResponses,
} from './openapi/error-responses.js';
import errorHandlerPlugin from './plugins/error-handler.js';
import { pathSummaries } from './openapi/path-summaries.js';
import { callbackSummaries } from './openapi/callback-summaries.js';
import { componentSchemaDescriptions } from './openapi/component-descriptions.js';
import { decorateOpenApi } from './openapi/decorate.js';

const API_PREFIX = '/v1';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
  }).withTypeProvider<TypeBoxTypeProvider>();

  for (const schema of sdxSchemas) app.addSchema(schema);
  for (const schema of resourceSchemas) app.addSchema(schema);
  app.addSchema(ProblemSchema);

  await app.register(swagger, {
    refResolver: {
      buildLocalReference: (json, _baseUri, _fragment, i) =>
        (json.$id as string | undefined) ?? `def-${i}`,
    },
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'SDX Partner Authorization Services API',
        version: '1.0.0',
        summary:
          'SDX partner authorization services API for subsystem access requests and provisioning callbacks.',
        description:
          'Secure Data Exchange (SDX), operated by the Government of the Province of British Columbia, exposes this API to partner services so that they can discover subsystem environments, submit integration access requests, and receive allowed-service provisioning callbacks.',
        license: { name: 'MIT' },
        contact: { name: 'BC Gov APS' },
      },
      servers: [
        {
          url: API_PREFIX,
          description: 'SDX Partner Authorization Services API base path.',
        },
      ],
      tags: [
        {
          name: 'Patterns',
          description:
            'Evaluate gateway patterns into resources and dispatch them to their owning providers.',
        },
        {
          name: 'Resources',
          description:
            'Apply multi-document resource files; each resource is dispatched to the provider (APS, SDX, GWA, or CSS) that owns its kind.',
        },
        {
          name: 'Subsystems',
          description:
            'Operations for partner services to query SDX for subsystem and access details and to submit new access requests.',
        },
      ],
      components: {
        securitySchemes: {
          jwt: {
            type: 'oauth2',
            description:
              'OAuth2 client-credentials flow used by partner services to authorize requests.',
            flows: {
              clientCredentials: {
                tokenUrl: 'https://token_endpoint',
                scopes: {
                  'Namespace.Manage': 'Manage namespaces',
                  'GatewayConfig.Publish': 'Publish gateway configurations',
                  'Namespace.Assign':
                    'Organization-level scope for managing gateways',
                  'System.Manage':
                    'System-level scope for managing organization system and services',
                },
              },
            },
          },
          portal: {
            type: 'http',
            description:
              'Bearer JWT issued by the APS Portal interactive login flow.',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          openid: {
            type: 'openIdConnect',
            description:
              'OpenID Connect discovery endpoint used to authenticate end-user sessions.',
            openIdConnectUrl: 'https://well_known_endpoint',
          },
        },
        responses: problemResponses,
      },
    },
    transformObject: (doc) =>
      'openapiObject' in doc
        ? decorateOpenApi(doc.openapiObject, {
            pathSummaries,
            callbackSummaries,
            componentSchemaDescriptions,
            errorResponseRefs: ERROR_RESPONSE_REFS,
          })
        : doc.swaggerObject,
  });

  await app.register(scalarReference, {
    routePrefix: '/docs',
    configuration: {
      pageTitle: 'SDX Partner Authorization Services API',
      showDeveloperTools: 'never',
      showSidebar: true,
      hideClientButton: true,
      mcp: { disabled: true },
      agent: { disabled: true },
    },
  });

  await app.register(errorHandlerPlugin);
  await app.register(clientsPlugin);
  await app.register(servicesPlugin);
  await app.register(controllersPlugin);
  await app.register(registerSubsystemsRoutes, { prefix: API_PREFIX });
  await app.register(registerResourcesRoutes, { prefix: API_PREFIX });
  await app.register(registerPatternsRoutes, { prefix: API_PREFIX });

  return app;
}
