// Offline contract harness. Real routes/controllers/services; SDX catalog and CSS are mocks.
import Fastify from 'fastify';
import { createServer } from 'node:http';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { registerPartnerAuth } from '../src/plugins/partner-auth.js';
import errorHandler from '../src/plugins/error-handler.js';
import { registerIntegrationAccessRoutes } from '../src/routes/integrationAccess.js';
import { sdxSchemas } from '../src/schemas/sdx.js';
import { IntegrationController } from '../src/controllers/integration-controller.js';
import { IntegrationAccessService } from '../src/services/integration-access-service.js';
import { CommonSsoService } from '../src/services/common-sso-service.js';

const input = JSON.parse(process.argv[2]);
const app = Fastify({ logger: false });
const callbacks: unknown[] = [];
const css = createServer(async (req, res) => {
  let body = '';
  for await (const chunk of req) body += chunk;
  callbacks.push({ method: req.method, path: req.url, body: JSON.parse(body) });
  res.writeHead(input.cssStatus ?? 204).end();
});
await new Promise<void>(resolve => css.listen(0, '127.0.0.1', resolve));
try {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const config = { issuer: 'https://css.example', audience: 'sdx', jwksUrl: 'https://css.example/keys', requiredScope: 'sdx:partner' };
  await app.register(errorHandler);
  registerPartnerAuth(app, config, createLocalJWKSet({ keys: [{ ...await exportJWK(publicKey), kid: 'css' }] }));
  for (const schema of sdxSchemas) app.addSchema(schema);
  const service = new IntegrationAccessService({} as any);
  service.api.listCatalogSubsystems = async () => [{ clientId: 'consumer', organization: { name: 'org' } }] as any;
  service.api.listConnections = async () => ['dev', 'test'].map(environment => ({
    clientId: 'consumer', environment, serviceId: `claims-${environment}`, isApproved: true, isActive: true,
    requesterDetails: { submissionId: `submission-${environment}`, scopes: ['read'], client: { integrationId: 'integration', clientId: `client-${environment}` } },
  })) as any;
  service.api.getOASService = async (name: string) => ({ name, environment: name.endsWith('test') ? 'test' : 'dev', version: '1.0.0', subsystem: { clientId: 'claims' } }) as any;
  app.decorate('controllers', { integration: new IntegrationController({ integrationAccess: service } as any) } as any);
  await app.register(registerIntegrationAccessRoutes, { prefix: '/v1' });
  const claims = { iss: config.issuer, aud: config.audience, scope: config.requiredScope, sub: 'css', iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000)+300, ...input.claims };
  const token = await new SignJWT(claims).setProtectedHeader({ alg: 'RS256', kid: 'css' }).sign(privateKey);
  const response = await app.inject({ url: input.url, headers: input.noToken ? {} : { authorization: `Bearer ${token}` } });
  let callbackStatus: number | undefined;
  if (input.callback && response.statusCode === 200) {
    const address = css.address() as { port: number };
    const client = { fetch: (path: string, init: RequestInit) => fetch(`http://127.0.0.1:${address.port}/${path}`, init) } as any;
    try {
      await new CommonSsoService(client).provisionAllowedServices(response.json());
      callbackStatus = 204;
    } catch (error: any) { callbackStatus = error.statusCode; }
  }
  process.stdout.write(JSON.stringify({ status: response.statusCode, body: response.json(), callbacks, callbackStatus }));
} finally {
  await app.close();
  await new Promise<void>((resolve, reject) => css.close(error => error ? reject(error) : resolve()));
}
