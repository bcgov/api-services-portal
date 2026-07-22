import Fastify, { type FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import scalarReference from '@scalar/fastify-api-reference';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import clientsPlugin from './plugins/clients.js';
import servicesPlugin from './plugins/services.js';
import controllersPlugin from './plugins/controllers.js';
import { registerResourceServersRoutes } from './routes/resource-servers.js';
import { registerResourcesRoutes } from './routes/connections.js';
import { registerPatternsRoutes } from './routes/patterns.js';
import { sdxSchemas } from './schemas/sdx.js';
import { resourceSchemas } from './schemas/resources.js';
import { runtimeGroupSchemas } from './schemas/runtime-groups.js';
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
import { registerIntegrationAccessRoutes } from './routes/integrationAccess.js';
import { registerGatewaysRoutes } from './routes/gateways.js';
import { registerRuntimeGroupsRoutes } from './routes/runtime-groups.js';

const API_PREFIX = '/v1';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
  }).withTypeProvider<TypeBoxTypeProvider>();

  for (const schema of sdxSchemas) app.addSchema(schema);
  for (const schema of resourceSchemas) app.addSchema(schema);
  for (const schema of runtimeGroupSchemas) app.addSchema(schema);
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
          'The Secure Data Exchange (SDX), operated by the Government of the Province of British Columbia, exposes this API to partner services so that they can discover subsystem environments, submit integration access requests, and receive allowed-service provisioning callbacks.',
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
          name: 'Integration Requests',
          description:
            'Submitting and retrieving status of integration access requests for SDX subsystem environments.',
        },
        {
          name: 'Subsystems',
          description:
            'Operations for partner services to query SDX for subsystem and access details and to submit new access requests.',
        },
        {
          name: 'Resource Provisioning',
          description:
            'Evaluate SDX patterns into resources and dispatch them to their applicable providers.',
        },
        {
          name: 'Gateways',
          description:
            'Query gateway (namespace) configuration and the tagged entities it owns.',
        },
        {
          name: 'Runtime Groups',
          description:
            'Operations against runtime group edge servers, such as CSR generation.',
        },
      ],
      components: {
        securitySchemes: {
          jwt: {
            type: 'http',
            scheme: 'bearer',
            description:
              'Bearer token issued by the SDX OAuth service client credentials flow',
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
  await app.register(registerResourceServersRoutes, { prefix: API_PREFIX });
  await app.register(registerResourcesRoutes, { prefix: API_PREFIX });
  await app.register(registerPatternsRoutes, { prefix: API_PREFIX });
  await app.register(registerIntegrationAccessRoutes, { prefix: API_PREFIX });
  await app.register(registerGatewaysRoutes, { prefix: API_PREFIX });
  await app.register(registerRuntimeGroupsRoutes, { prefix: API_PREFIX });

  return app;
}
