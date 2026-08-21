import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import {
  CsrRequest,
  CsrResponse,
  CertTokenResponse,
} from '../schemas/runtime-groups.js';

const RUNTIME_GROUP_DESC =
  'Name of the runtime group the CSR is requested for.';
const ENVIRONMENT_DESC =
  'Target environment (for example `dev`, `test`, or `prod`) whose edge server the request is routed to.';

const security = [] as any[];

export const registerRuntimeGroupsRoutes: FastifyPluginAsyncTypebox = async (
  app
) => {
  app.post(
    '/organizations/:org/runtime-groups/:name/environments/:env/csr',
    {
      schema: {
        tags: ['Runtime Groups'],
        summary: 'Create runtime group CSR',
        operationId: 'createRuntimeGroupCsr',
        description:
          'Requests a new key pair and certificate signing request (CSR) ' +
          'from the runtime group edge server for the target environment.',
        security,
        params: Type.Object({
          org: Type.String({
            description: 'Organization name the runtime group belongs to.',
            examples: ['my-org'],
          }),
          name: Type.String({
            description: RUNTIME_GROUP_DESC,
            examples: ['my-rg'],
          }),
          env: Type.String({
            description: ENVIRONMENT_DESC,
            examples: ['dev'],
          }),
        }),
        body: Type.Ref(CsrRequest),
        response: { 200: Type.Ref(CsrResponse) },
      },
    },
    async (req) =>
      app.controllers.runtimeGroups.createCsr({
        org: req.params.org,
        name: req.params.name,
        environment: req.params.env,
        request: req.body,
      })
  );

  app.post(
    '/organizations/:org/runtime-groups/:name/environments/:env/cert-token',
    {
      schema: {
        tags: ['Runtime Groups'],
        summary: 'Generate runtime group certificate-signing token',
        operationId: 'generateRuntimeGroupCertToken',
        description:
          'Requests a one-time-use certificate-signing token from the ' +
          "target environment's CA (step-ca), resolved from that " +
          'environment configuration rather than a single, global CA. ' +
          'The certificate subject and SANs are derived from the runtime ' +
          'group named in the path.',
        security,
        params: Type.Object({
          org: Type.String({
            description: 'Organization name the runtime group belongs to.',
            examples: ['my-org'],
          }),
          name: Type.String({
            description: RUNTIME_GROUP_DESC,
            examples: ['my-rg'],
          }),
          env: Type.String({
            description: ENVIRONMENT_DESC,
            examples: ['dev'],
          }),
        }),
        response: { 200: Type.Ref(CertTokenResponse) },
      },
    },
    async (req) =>
      app.controllers.runtimeGroups.generateCertToken({
        org: req.params.org,
        name: req.params.name,
        environment: req.params.env,
      })
  );
};
