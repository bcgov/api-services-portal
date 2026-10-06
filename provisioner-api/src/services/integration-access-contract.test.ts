import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Value } from '@sinclair/typebox/value';

import { buildApp } from '../app.js';
import type { OAuthClient } from '../clients/oauth.js';
import type {
  ConnectionRequest,
  ServiceCatalogEntry,
  SubsystemEntry,
} from '../clients/sdx-member/index.js';
import { NewIntegrationAccessRequest } from '../schemas/sdx.js';
import { IntegrationAccessService } from './integration-access-service.js';

const client = {
  name: 'test',
  baseUrl: 'https://example.test',
  configured: true,
  getToken: async () => 'token',
  fetch: async () => new Response(),
} satisfies OAuthClient;

const consumerSubsystem: SubsystemEntry = {
  name: 'Consumer',
  clientId: 'consumer-subsystem',
  privacyZone: 'urn:consumer',
  organization: { name: 'consumer-org' },
  integrationClientIds: ['css-integration'],
};

const catalogService: ServiceCatalogEntry = {
  name: 'claims-service',
  title: 'Claims service',
  version: '2.4.0',
  description: 'Claims',
  environment: 'dev',
  operations: [
    {
      path: '/claims',
      method: 'get',
      summary: 'Read claims',
      operationId: 'getClaims',
      scopes: [{ name: 'Claims.Read' }],
    },
  ],
  subsystem: {
    name: 'Claims',
    clientId: 'claims-subsystem',
    privacyZone: 'urn:claims',
    organization: { name: 'claims-org' },
    integrationClientIds: [],
  },
};

const request = {
  requester: { displayName: 'Jane Doe', email: 'jane@example.gov.bc.ca' },
  clientId: 'css-client',
  policyVersion: 'SDX.R1.00',
  privacyZone: 'urn:consumer',
  resourceServers: [
    {
      id: 'claims-subsystem',
      environment: 'dev',
      services: [{ name: 'claims-service', scopes: ['Claims.Read'] }],
    },
  ],
};

function requestWithVersion(version: string): any {
  const versionedRequest = structuredClone(request);
  versionedRequest.resourceServers[0].services[0] = {
    ...versionedRequest.resourceServers[0].services[0],
    version,
  };
  return versionedRequest;
}

function serviceWithApi(api: Record<string, unknown>) {
  const service = new IntegrationAccessService(client);
  (service as unknown as { api: Record<string, unknown> }).api = api;
  (
    service as unknown as {
      policyService: { getDefaultResources: () => unknown };
    }
  ).policyService = {
    getDefaultResources: () => ({ clientResources: {}, serviceResources: {} }),
  };
  return service;
}

test('partner API documents the callback path implemented by CSS', async () => {
  const app = await buildApp();
  try {
    await app.ready();
    const spec = app.swagger() as any;
    const callbacks =
      spec.paths['/integrations/{integrationId}/access-requests'].post
        .callbacks.provisionAllowedServices;

    assert.ok(
      callbacks[
        '/requests/{$request.params#/integrationId}/sdx-allowed-access'
      ]
    );
    assert.equal(
      callbacks[
        '/requests/{$request.params#/integrationId}/sdx-allowed-services'
      ],
      undefined
    );
  } finally {
    await app.close();
  }
});

test('access-request service version remains optional for existing callers', async () => {
  assert.equal(Value.Check(NewIntegrationAccessRequest, request), true);

  const upserts: unknown[] = [];
  const service = serviceWithApi({
    listConnections: async () => [],
    getOASService: async () => catalogService,
    upsertConnection: async (_organization: string, body: unknown) => {
      upserts.push(body);
      return { status: 200, result: 'created' };
    },
  });

  await service.submitIntegrationAccessRequest(
    'submission-1',
    consumerSubsystem,
    'css-integration',
    request
  );

  assert.equal(upserts.length, 1);
  assert.equal(
    (upserts[0] as any).requesterDetails.service.version,
    catalogService.version
  );
});

test('access requests reject a supplied version that differs from the catalog', async () => {
  const service = serviceWithApi({
    listConnections: async () => [],
    getOASService: async () => catalogService,
    upsertConnection: async () => ({ status: 200, result: 'created' }),
  });
  const versionedRequest = requestWithVersion('1.0.0');

  await assert.rejects(
    service.submitIntegrationAccessRequest(
      'submission-1',
      consumerSubsystem,
      'css-integration',
      versionedRequest
    ),
    /version '1\.0\.0' does not match catalog version '2\.4\.0'/
  );
});

test('route accepts a matching version and persists the reviewed version', async () => {
  const app = await buildApp();
  const upserts: any[] = [];

  try {
    await app.ready();
    const services = app.services as any;
    services.sdxMember.getSubsystemByIntegrationClientId = async () =>
      consumerSubsystem;
    services.integrationAccess.api = {
      listConnections: async () => [],
      getOASService: async () => catalogService,
      upsertConnection: async (_organization: string, body: unknown) => {
        upserts.push(body);
        return { status: 200, result: 'created' };
      },
    };
    services.integrationAccess.policyService = {
      getDefaultResources: () => ({
        clientResources: {},
        serviceResources: {},
      }),
    };
    services.activity.publishActivity = async () => undefined;

    const response = await app.inject({
      method: 'POST',
      url: '/v1/integrations/css-integration/access-requests',
      payload: requestWithVersion('2.4.0'),
    });

    assert.equal(response.statusCode, 200);
    assert.equal(upserts.length, 1);
    assert.equal(
      upserts[0].requesterDetails.service.version,
      catalogService.version
    );
  } finally {
    await app.close();
  }
});

test('route schema rejects a supplied blank version before the handler', async () => {
  const app = await buildApp();
  let called = false;

  try {
    await app.ready();
    (app.controllers.integration as any).createIntegrationAccessRequest =
      async () => {
        called = true;
        return { submissionId: 'unexpected', results: {} };
      };

    const blankRequest = requestWithVersion('');
    assert.equal(Value.Check(NewIntegrationAccessRequest, blankRequest), false);

    const response = await app.inject({
      method: 'POST',
      url: '/v1/integrations/css-integration/access-requests',
      payload: blankRequest,
    });

    assert.equal(response.statusCode, 400);
    assert.equal(called, false);
  } finally {
    await app.close();
  }
});
test('allowed-services responses contain the authoritative catalog version', async () => {
  const connection: ConnectionRequest = {
    clientId: consumerSubsystem.clientId,
    serviceId: catalogService.name,
    environment: 'dev',
    isApproved: true,
    requesterDetails: {
      submissionId: 'submission-1',
      scopes: ['Claims.Read'],
      client: {
        integrationId: 'css-integration',
        clientId: 'css-client',
      },
      service: {
        clientId: catalogService.subsystem.clientId,
        version: catalogService.version,
      },
    },
  };
  const service = serviceWithApi({
    listCatalogSubsystems: async () => [consumerSubsystem],
    listConnections: async () => [connection],
    getOASService: async () => ({
      ...catalogService,
      version: '3.0.0',
    }),
  });

  const result = await service.buildIntegrationAllowedServices(
    'css-integration',
    'dev',
    'approved'
  );

  assert.deepEqual(result.resourceServers[0].services, [
    {
      name: 'claims-service',
      version: '2.4.0',
      scopes: ['Claims.Read'],
    },
  ]);
});

test('catalog version changes require reapproval for a pinned connection', async () => {
  const upserts: any[] = [];
  const service = serviceWithApi({
    listConnections: async () => [
      {
        clientId: consumerSubsystem.clientId,
        serviceId: catalogService.name,
        isApproved: true,
        requesterDetails: {
          scopes: ['Claims.Read'],
          service: {
            clientId: catalogService.subsystem.clientId,
            version: '1.0.0',
          },
        },
      },
    ],
    getOASService: async () => catalogService,
    upsertConnection: async (_organization: string, body: unknown) => {
      upserts.push(body);
      return { status: 200, result: 'updated' };
    },
  });

  const result = await service.submitIntegrationAccessRequest(
    'submission-2',
    consumerSubsystem,
    'css-integration',
    request
  );

  assert.equal(
    result.results[catalogService.name],
    'updated version, submitted for re-approval'
  );
  assert.equal(upserts[0].isApproved, false);
  assert.equal(
    upserts[0].requesterDetails.service.version,
    catalogService.version
  );
});
