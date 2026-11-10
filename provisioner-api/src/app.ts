import type { JWTVerifyGetKey } from 'jose';
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

import {
  registerPartnerAuth,
  partnerAuthConfig,
  type PartnerAuthConfig,
} from './plugins/partner-auth.js';

const API_PREFIX = '/v1';

export async function buildApp(
  options: {
    listener?: 'internal' | 'partner';
    auth?: PartnerAuthConfig;
    authKey?: JWTVerifyGetKey;
  } = {}
): Promise<FastifyInstance> {
  const partner = options.listener === 'partner';
  const title = partner
    ? 'SDX Partner Authorization Services API'
    : 'SDX Provisioner API';
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
  }).withTypeProvider<TypeBoxTypeProvider>();

  for (const schema of sdxSchemas) app.addSchema(schema);
  if (!partner) {
    for (const schema of resourceSchemas) app.addSchema(schema);
    for (const schema of runtimeGroupSchemas) app.addSchema(schema);
  }
  app.addSchema(ProblemSchema);

  await app.register(swagger, {
    refResolver: {
      buildLocalReference: (json, _baseUri, _fragment, i) =>
        (json.$id as string | undefined) ?? `def-${i}`,
    },
    openapi: {
      openapi: '3.1.0',
      info: {
        title,
        version: '1.0.0',
        summary: partner
          ? 'SDX partner authorization services API for subsystem access requests and provisioning callbacks.'
          : 'Internal Portal API for resource provisioning and gateway operations.',
        description: partner
          ? 'The Secure Data Exchange (SDX), operated by the Government of the Province of British Columbia, exposes this API to partner services so that they can discover subsystem environments, submit integration access requests, and receive allowed-service provisioning callbacks.'
          : 'Internal provisioner operations used by the Portal to manage resources, patterns, gateways and runtime groups.',
        license: { name: 'MIT' },
        contact: { name: 'BC Gov APS' },
      },
      servers: [
        {
          url: API_PREFIX,
          description: `${title} base path.`,
        },
      ],
      tags: partner
        ? [
            {
              name: 'Integration Requests',
              description:
                'Integration discovery, access requests and allowed grants.',
            },
            {
              name: 'Resource Servers',
              description: 'Environment-filtered resource server discovery.',
            },
          ]
        : [
            {
              name: 'Resource Provisioning',
              description:
                'Evaluate SDX patterns and dispatch resources to providers.',
            },
            {
              name: 'Gateways',
              description: 'Gateway configuration and owned resources.',
            },
            {
              name: 'Runtime Groups',
              description: 'Runtime group certificate operations.',
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
        responses: partner ? {} : problemResponses,
      },
    },
    transformObject: (doc) =>
      'openapiObject' in doc
        ? decorateOpenApi(doc.openapiObject, {
            pathSummaries,
            callbackSummaries,
            componentSchemaDescriptions,
            errorResponseRefs: partner ? {} : ERROR_RESPONSE_REFS,
          })
        : doc.swaggerObject,
  });

  await app.register(scalarReference, {
    routePrefix: '/docs',
    configuration: {
      pageTitle: title,
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
  if (partner) {
    // Keep authentication encapsulated with the API routes so Scalar's public
    // reference, assets and OpenAPI documents remain accessible without a token.
    await app.register(async (partnerApi) => {
      registerPartnerAuth(
        partnerApi,
        options.auth ?? partnerAuthConfig(),
        options.authKey
      );
      await partnerApi.register(registerResourceServersRoutes, { prefix: API_PREFIX });
      await partnerApi.register(registerIntegrationAccessRoutes, { prefix: API_PREFIX });
    });
  } else {
    await app.register(registerResourcesRoutes, { prefix: API_PREFIX });
    await app.register(registerPatternsRoutes, { prefix: API_PREFIX });
    await app.register(registerGatewaysRoutes, { prefix: API_PREFIX });
    await app.register(registerRuntimeGroupsRoutes, { prefix: API_PREFIX });
  }

  return app;
}
