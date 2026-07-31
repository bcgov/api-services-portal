import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import {
  CsrRequest,
  CsrResponse,
  CertSignTokenResponse,
} from '../schemas/runtime-groups.js';

const RUNTIME_GROUP_DESC =
  'Name of the runtime group the CSR is requested for.';
const ENVIRONMENT_DESC =
  'Target environment (for example `dev`, `test`, or `prod`) whose edge server the request is routed to.';

const security = [{ jwt: [] }];

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
    '/organizations/:org/runtime-groups/:name/environments/:env/csr-sign-token',
    {
      schema: {
        tags: ['Runtime Groups'],
        summary: 'Create runtime group certificate-signing token',
        operationId: 'createRuntimeGroupCertSignToken',
        description:
          'Requests a new one-time-use certificate-signing token from ' +
          "the CA token issuer for the runtime group's target environment.",
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
        response: { 200: Type.Ref(CertSignTokenResponse) },
      },
    },
    async (req) =>
      app.controllers.runtimeGroups.createCertSignToken({
        org: req.params.org,
        name: req.params.name,
        environment: req.params.env,
      })
  );
};
