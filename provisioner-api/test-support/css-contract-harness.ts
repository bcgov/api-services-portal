// Real partner app, routes, controllers, SDX client, policies and CSS dispatcher.
// Only the external SDX catalog/connection store, Feed and CSS are HTTP fixtures.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { buildApp } from '../src/app.js';
import type {
  ConnectionRequest,
  ServiceCatalogEntry,
  SubsystemEntry,
} from '../src/clients/sdx-member/index.js';

const input = JSON.parse(process.argv[2]);
process.env.LOG_LEVEL = 'silent';
const consumer: SubsystemEntry = {
  name: 'Consumer',
  clientId: 'consumer',
  organization: { name: 'org' },
  integrationClientIds: ['integration'],
  privacyZone: 'urn:consumer',
  gateway: { id: 'consumer-gateway' },
};
const provider: SubsystemEntry = {
  name: 'Claims',
  clientId: 'claims',
  organization: { name: 'provider' },
  integrationClientIds: [],
  privacyZone: 'urn:claims',
};
const catalog: ServiceCatalogEntry[] = ['dev', 'test'].map((environment) => ({
  name: `claims-${environment}`,
  environment,
  version: '1.0.0',
  title: 'Claims',
  description: 'Claims service',
  subsystem: provider,
  operations: [
    {
      path: '/claims',
      method: 'get',
      operationId: 'readClaims',
      summary: 'Read claims',
      scopes: [{ name: 'read' }, { name: 'write' }],
    },
  ],
}));
const connections: ConnectionRequest[] =
  input.initial === 'empty'
    ? []
    : ['dev', 'test'].map((environment) => ({
        id: `connection-${environment}`,
        clientId: 'consumer',
        environment,
        serviceId: `claims-${environment}`,
        policyVersion: 'SDX.R1.00',
        isApproved: true,
        isActive: true,
        requesterDetails: {
          submissionId: `submission-${environment}`,
          scopes: ['read'],
          client: {
            integrationId: 'integration',
            clientId: `client-${environment}`,
          },
          service: { clientId: 'claims', version: '1.0.0' },
        },
      }));
const callbacks: unknown[] = [];
const writes: unknown[] = [];
const upstreamCalls: string[] = [];
let cssStatus = input.cssStatus ?? 204;
let cssDisconnect = false;
let upstreamStatus = 0;
const mock = createServer(async (req, res) => {
  try {
    const url = new URL(req.url!, 'http://fixture');
    let text = '';
    for await (const chunk of req) text += chunk;
    const body = text ? JSON.parse(text) : undefined;
    const send = (value: unknown, status = 200) => {
      res
        .writeHead(status, { 'content-type': 'application/json' })
        .end(JSON.stringify(value));
    };
    if (url.pathname.startsWith('/css/')) {
      callbacks.push({
        method: req.method,
        path: url.pathname.replace('/css', ''),
        body,
      });
      if (cssDisconnect) {
        req.socket.destroy();
        return;
      }
      res.writeHead(cssStatus).end();
      return;
    }
    if (url.pathname.startsWith('/feed/')) {
      send({ status: 200, result: 'recorded' });
      return;
    }
    upstreamCalls.push(`${req.method} ${url.pathname}${url.search}`);
    if (upstreamStatus) {
      send({ error: 'upstream unavailable' }, upstreamStatus);
      return;
    }
    const path = url.pathname.replace('/sdx/', '');
    if (path === 'catalog/subsystems') {
      send(
        url.searchParams.get('integrationClientId') === 'integration'
          ? [consumer]
          : []
      );
    } else if (
      path === 'catalog/subsystems/consumer' ||
      path === 'organizations/org/clients/Consumer'
    ) {
      send(consumer);
    } else if (path === 'catalog/services') {
      send(catalog);
    } else if (path.startsWith('catalog/services/')) {
      const service = catalog.find(
        (s) =>
          s.name === decodeURIComponent(path.slice('catalog/services/'.length))
      );
      send(
        service ?? { error: 'service no longer exists' },
        service ? 200 : 404
      );
    } else if (/^organizations\/[^/]+\/connections$/.test(path)) {
      if (req.method === 'GET') {
        send(connections);
        return;
      }
      assert.equal(req.method, 'PUT');
      writes.push(structuredClone(body));
      const existing = connections.find(
        (c) => c.clientId === body.clientId && c.serviceId === body.serviceId
      );
      if (existing) Object.assign(existing, body);
      else
        connections.push({
          ...body,
          id: `connection-${body.environment}`,
          isApproved: false,
          isActive: false,
        });
      send({ status: 200, result: existing ? 'updated' : 'created' });
    } else send({ error: `Unhandled mock path ${path}` }, 500);
  } catch (error) {
    res.writeHead(500).end(JSON.stringify({ error: String(error) }));
  }
});
await new Promise<void>((resolve, reject) => {
  mock.once('error', reject);
  mock.listen(0, '127.0.0.1', resolve);
});
const address = mock.address() as { port: number };
const mockBase = `http://127.0.0.1:${address.port}`;
process.env.FEED_URL = `${mockBase}/feed`;
const { publicKey, privateKey } = await generateKeyPair('RS256');
const auth = {
  issuer: 'https://css.example',
  audience: 'sdx',
  jwksUrl: 'https://css.example/keys',
  requiredScope: 'sdx:partner',
};
const app = await buildApp({
  listener: 'partner',
  auth,
  authKey: createLocalJWKSet({
    keys: [{ ...(await exportJWK(publicKey)), kid: 'css' }],
  }),
});
try {
  // Replace only OAuth transport; all upstream HTTP serialization/error handling is real.
  for (const [client, prefix] of [
    [app.clients.sdx, 'sdx'],
    [app.clients.css, 'css'],
  ] as const) {
    Object.assign(client, {
      configured: true,
      fetch: (path: string, init?: RequestInit) =>
        fetch(`${mockBase}/${prefix}/${path}`, init),
    });
  }
  await app.listen({ host: '127.0.0.1', port: 0 });
  const partnerBase = app.listeningOrigin;
  const request = async (step: any) => {
    const claims = {
      iss: auth.issuer,
      aud: auth.audience,
      scope: auth.requiredScope,
      sub: 'css',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 300,
      ...step.claims,
    };
    const token = await new SignJWT(claims)
      .setProtectedHeader({ alg: 'RS256', kid: 'css' })
      .sign(privateKey);
    const response = await fetch(`${partnerBase}${step.url}`, {
      method: step.method ?? 'GET',
      headers: {
        ...(step.noToken
          ? {}
          : { authorization: `Bearer ${step.invalidToken ?? token}` }),
        ...(step.body === undefined
          ? {}
          : { 'content-type': 'application/json' }),
      },
      body: step.body === undefined ? undefined : JSON.stringify(step.body),
    });
    return {
      status: response.status,
      body: await response.json(),
      contentType: response.headers.get('content-type'),
    };
  };
  const callback = async (environment: string) => {
    const connection = connections.find((c) => c.environment === environment)!;
    try {
      const resources =
        await app.services.patternsEvaluator.buildResourcesUsingPattern({
          patternName: 'sdx-p2p-consumer-access.r1',
          parameters: {
            connId: connection.id,
            clientId: connection.clientId,
            serviceId: connection.serviceId,
          },
          action: 'apply',
        });
      const cssResources = resources.documents.filter(
        (doc) => doc.kind === 'IntegrationAllowedServices'
      );
      return {
        results: await app.services.resourceDispatcher.dispatch(
          'consumer-gateway',
          environment,
          cssResources,
          'apply'
        ),
      };
    } catch (error: any) {
      return {
        error: {
          status: error.statusCode ?? 500,
          code: error.code,
          message: error.message,
        },
      };
    }
  };
  const results: unknown[] = [];
  for (const step of input.steps ?? [input]) {
    if (step.mutate) {
      const {
        service = 'claims-dev',
        remove,
        version,
        scopes,
        environment,
        providerId,
        approved,
        active,
        duplicateClient,
        cssStatus: nextCssStatus,
        disconnect,
        upstreamStatus: nextUpstreamStatus,
      } = step.mutate;
      const entry = catalog.find((s) => s.name === service);
      if (remove && entry) catalog.splice(catalog.indexOf(entry), 1);
      if (entry && version !== undefined) entry.version = version;
      if (entry && scopes)
        entry.operations[0].scopes = scopes.map((name: string) => ({ name }));
      if (entry && environment) entry.environment = environment;
      if (entry && providerId)
        entry.subsystem = { ...entry.subsystem, clientId: providerId };
      for (const connection of connections.filter(
        (c) => c.serviceId === service
      )) {
        if (approved !== undefined) connection.isApproved = approved;
        if (active !== undefined) connection.isActive = active;
      }
      if (duplicateClient) {
        const source = connections.find((c) => c.serviceId === service)!;
        connections.push({
          ...structuredClone(source),
          id: 'duplicate',
          requesterDetails: {
            ...source.requesterDetails,
            client: {
              ...source.requesterDetails.client,
              clientId: 'conflicting-client',
            },
          },
        });
      }
      if (nextCssStatus !== undefined) cssStatus = nextCssStatus;
      if (disconnect !== undefined) cssDisconnect = disconnect;
      if (nextUpstreamStatus !== undefined) upstreamStatus = nextUpstreamStatus;
    }
    if (step.approve) {
      for (const connection of connections.filter(
        (c) => c.environment === step.approve
      )) {
        connection.isApproved = true;
        connection.isActive = true;
      }
    }
    const result: any = step.url ? await request(step) : {};
    if (step.callback)
      result.callback = await callback(step.environment ?? 'dev');
    results.push(result);
  }
  process.stdout.write(
    JSON.stringify({
      ...(results[0] as any),
      results,
      callbacks,
      writes,
      connections,
      upstreamCalls,
      spec: input.spec ? app.swagger() : undefined,
    })
  );
} finally {
  await app.close();
  await new Promise<void>((resolve, reject) =>
    mock.close((error) => (error ? reject(error) : resolve()))
  );
}
