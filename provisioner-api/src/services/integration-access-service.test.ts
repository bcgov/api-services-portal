import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { OAuthClient } from '../clients/oauth.js';
import type {
  BatchResult,
  ConnectionRequest,
  ConnectionRequestInput,
  SdxMemberApiClient,
  ServiceCatalogEntry,
  SubsystemEntry,
} from '../clients/sdx-member/index.js';
import type { TNewIntegrationAccessRequest } from '../schemas/sdx.js';
import { IntegrationAccessService } from './integration-access-service.js';

const consumerSubsystem: SubsystemEntry = {
  name: 'Consumer',
  clientId: 'consumer-subsystem',
  integrationClientIds: ['integration-a'],
  organization: { name: 'consumer-org' },
  privacyZone: 'citizen',
};

function catalogService(
  name: string,
  providerId: string,
  environment = 'dev',
  declaredScopes = ['read', 'write']
): ServiceCatalogEntry {
  return {
    name,
    title: name,
    version: '1.0.0',
    description: `${name} service`,
    environment,
    operations: [
      {
        path: '/resource',
        method: 'get',
        summary: 'Get resource',
        operationId: `get-${name}`,
        scopes: declaredScopes.map((scope) => ({ name: scope })),
      },
    ],
    subsystem: {
      name: providerId,
      clientId: providerId,
      integrationClientIds: [],
      organization: { name: `${providerId}-org` },
      privacyZone: 'health',
    },
  };
}

function accessRequest(
  resourceServers: TNewIntegrationAccessRequest['resourceServers'],
  overrides: Partial<TNewIntegrationAccessRequest> = {}
): TNewIntegrationAccessRequest {
  return {
    requester: { displayName: 'Jane Doe', email: 'jane@example.test' },
    clientId: 'oauth-client-a',
    policyVersion: 'SDX.R1.00',
    privacyZone: 'citizen',
    resourceServers,
    ...overrides,
  };
}

interface FakeApiOptions {
  catalog?: Record<string, ServiceCatalogEntry>;
  connections?: ConnectionRequest[];
  subsystems?: SubsystemEntry[];
  upsert?: (org: string, input: ConnectionRequestInput) => Promise<BatchResult>;
}

function createService(options: FakeApiOptions = {}) {
  const writes: Array<{ org: string; input: ConnectionRequestInput }> = [];
  const catalog = options.catalog || {};
  const api = {
    getOASService: async (name: string) => {
      const service = catalog[name];
      if (!service) throw new Error(`Unexpected catalog lookup: ${name}`);
      return service;
    },
    listConnections: async () => options.connections || [],
    listCatalogSubsystems: async () =>
      options.subsystems || [consumerSubsystem],
    upsertConnection: async (org: string, input: ConnectionRequestInput) => {
      writes.push({ org, input });
      return options.upsert
        ? options.upsert(org, input)
        : { status: 200, result: 'updated' };
    },
  } as unknown as SdxMemberApiClient;

  const service = new IntegrationAccessService({} as OAuthClient);
  Object.assign(service, { api });
  return { service, writes };
}

function existingConnection(
  overrides: Partial<ConnectionRequest> = {}
): ConnectionRequest {
  return {
    id: 'connection-1',
    clientId: consumerSubsystem.clientId,
    serviceId: 'service-a',
    environment: 'dev',
    policyVersion: 'SDX.R1.00',
    isApproved: true,
    requesterDetails: {
      submissionId: 'submission-100-a',
      requester: { name: 'Jane Doe', email: 'jane@example.test' },
      scopes: ['read'],
      client: {
        integrationId: 'integration-a',
        clientId: 'oauth-client-a',
        privacyZone: 'citizen',
      },
      service: { clientId: 'provider-a', privacyZone: 'health' },
    },
    ...overrides,
  };
}

test('validates every requested service before writing any connection', async () => {
  const { service, writes } = createService({
    catalog: {
      'a-valid': catalogService('a-valid', 'provider-a'),
      'z-invalid': catalogService('z-invalid', 'provider-a', 'prod'),
    },
  });

  await assert.rejects(
    service.submitIntegrationAccessRequest(
      'submission-1',
      consumerSubsystem,
      'integration-a',
      accessRequest([
        {
          id: 'provider-a',
          environment: 'dev',
          services: [
            { name: 'a-valid', scopes: ['read'] },
            { name: 'z-invalid', scopes: ['read'] },
          ],
        },
      ])
    ),
    /does not match requested resource server environment/
  );

  assert.deepEqual(writes, []);
});

test('rejects blank OAuth client IDs and unsupported policies before catalog access', async () => {
  let catalogReads = 0;
  const { service, writes } = createService();
  Object.assign(service.api, {
    getOASService: async () => {
      catalogReads++;
      throw new Error('must not be called');
    },
  });
  const request = accessRequest([
    {
      id: 'provider-a',
      environment: 'dev',
      services: [{ name: 'service-a', scopes: [] }],
    },
  ]);

  await assert.rejects(
    service.submitIntegrationAccessRequest(
      'submission-1',
      consumerSubsystem,
      'integration-a',
      { ...request, clientId: '   ' }
    ),
    /OAuth client ID must not be blank/
  );
  await assert.rejects(
    service.submitIntegrationAccessRequest(
      'submission-1',
      consumerSubsystem,
      'integration-a',
      { ...request, policyVersion: 'SDX.UNKNOWN' }
    ),
    /Policy SDX.UNKNOWN not found in registry/
  );

  assert.equal(catalogReads, 0);
  assert.deepEqual(writes, []);
});

test('merges duplicate services and scopes while allowing an empty scope set', async () => {
  const { service, writes } = createService({
    catalog: {
      'empty-service': catalogService('empty-service', 'provider-a', 'dev', []),
      'scoped-service': catalogService('scoped-service', 'provider-a'),
    },
  });

  const response = await service.submitIntegrationAccessRequest(
    ' submission-1 ',
    consumerSubsystem,
    ' integration-a ',
    accessRequest([
      {
        id: 'provider-a',
        environment: 'dev',
        services: [
          { name: 'scoped-service', scopes: ['write', 'read', 'write'] },
          { name: 'empty-service', scopes: [] },
        ],
      },
      {
        id: 'provider-a',
        environment: 'dev',
        services: [{ name: 'scoped-service', scopes: ['read'] }],
      },
    ])
  );

  assert.equal(writes.length, 2);
  assert.deepEqual(
    writes.map(({ input }) => ({
      serviceId: input.serviceId,
      scopes: input.requesterDetails.scopes,
      integrationId: input.requesterDetails.client.integrationId,
    })),
    [
      {
        serviceId: 'empty-service',
        scopes: [],
        integrationId: 'integration-a',
      },
      {
        serviceId: 'scoped-service',
        scopes: ['read', 'write'],
        integrationId: 'integration-a',
      },
    ]
  );
  assert.deepEqual(response, {
    submissionId: 'submission-1',
    results: {
      'empty-service': 'submitted approval request',
      'scoped-service': 'submitted approval request',
    },
  });
});

test('awaits a scope update and sends it to the provider organization', async () => {
  let releaseWrite!: () => void;
  let signalWriteStarted!: () => void;
  const writeStarted = new Promise<void>((resolve) => {
    signalWriteStarted = resolve;
  });
  const writeGate = new Promise<BatchResult>((resolve) => {
    releaseWrite = () => resolve({ status: 200, result: 'updated' });
  });
  const { service, writes } = createService({
    catalog: { 'service-a': catalogService('service-a', 'provider-a') },
    connections: [existingConnection()],
    upsert: async () => {
      signalWriteStarted();
      return writeGate;
    },
  });

  let settled = false;
  const pending = service
    .submitIntegrationAccessRequest(
      'submission-2',
      consumerSubsystem,
      'integration-a',
      accessRequest([
        {
          id: 'provider-a',
          environment: 'dev',
          services: [{ name: 'service-a', scopes: ['write', 'read'] }],
        },
      ])
    )
    .then((result) => {
      settled = true;
      return result;
    });

  await writeStarted;
  assert.equal(settled, false);
  releaseWrite();
  const response = await pending;

  assert.equal(writes.length, 1);
  assert.equal(writes[0].org, 'provider-a-org');
  assert.deepEqual(writes[0].input, {
    clientId: 'consumer-subsystem',
    serviceId: 'service-a',
    isApproved: false,
    requesterDetails: {
      submissionId: 'submission-2',
      requester: { name: 'Jane Doe', email: 'jane@example.test' },
      scopes: ['read', 'write'],
      client: {
        integrationId: 'integration-a',
        clientId: 'oauth-client-a',
        privacyZone: 'citizen',
      },
      service: { clientId: 'provider-a', privacyZone: 'health' },
    },
  });
  assert.deepEqual(response.results, {
    'service-a': 'updated scopes, submitted for re-approval',
  });
});

test('fails closed rather than overwriting a shared connection owned by another client grant', async () => {
  const { service, writes } = createService({
    catalog: { 'service-a': catalogService('service-a', 'provider-a') },
    connections: [
      existingConnection({
        requesterDetails: {
          ...existingConnection().requesterDetails,
          client: {
            integrationId: 'integration-b',
            clientId: 'oauth-client-b',
          },
        },
      }),
    ],
  });

  await assert.rejects(
    service.submitIntegrationAccessRequest(
      'submission-2',
      consumerSubsystem,
      'integration-a',
      accessRequest([
        {
          id: 'provider-a',
          environment: 'dev',
          services: [{ name: 'service-a', scopes: ['read'] }],
        },
      ])
    ),
    /client grants are required before this connection can be shared/
  );
  assert.deepEqual(writes, []);
});

test('does not confuse another consuming subsystem connection with shared connection identity', async () => {
  const { service, writes } = createService({
    catalog: { 'service-a': catalogService('service-a', 'provider-a') },
    connections: [existingConnection({ clientId: 'another-subsystem' })],
  });

  await service.submitIntegrationAccessRequest(
    'submission-2',
    consumerSubsystem,
    'integration-a',
    accessRequest([
      {
        id: 'provider-a',
        environment: 'dev',
        services: [{ name: 'service-a', scopes: ['read'] }],
      },
    ])
  );

  assert.equal(writes.length, 1);
  assert.equal(writes[0].input.clientId, consumerSubsystem.clientId);
  assert.equal(writes[0].input.serviceId, 'service-a');
});

test('builds deterministic allowed services after filtering the exact integration and environment', async () => {
  const connections: ConnectionRequest[] = [
    existingConnection({
      id: 'unrelated',
      serviceId: 'wrong-service',
      requesterDetails: {
        ...existingConnection().requesterDetails,
        client: { integrationId: 'integration-b', clientId: 'wrong-client' },
      },
    }),
    existingConnection({
      id: 'z',
      serviceId: 'z-service',
      requesterDetails: {
        ...existingConnection().requesterDetails,
        submissionId: 'submission-100-a',
        scopes: ['write', 'read', 'read'],
      },
    }),
    existingConnection({
      id: 'a',
      serviceId: 'a-service',
      requesterDetails: {
        ...existingConnection().requesterDetails,
        submissionId: 'submission-200-b',
        scopes: [],
      },
    }),
    existingConnection({
      id: 'b',
      serviceId: 'b-service',
      requesterDetails: {
        ...existingConnection().requesterDetails,
        submissionId: 'submission-150-c',
        scopes: ['alpha'],
      },
    }),
  ];
  const { service } = createService({
    connections,
    catalog: {
      'a-service': catalogService('a-service', 'provider-a', 'dev', []),
      'b-service': catalogService('b-service', 'provider-a', 'dev', ['alpha']),
      'z-service': catalogService('z-service', 'provider-z'),
    },
  });

  const response = await service.buildIntegrationAllowedServices(
    'integration-a',
    'dev',
    'approved'
  );

  assert.deepEqual(response, {
    integrationId: 'integration-a',
    clientId: 'oauth-client-a',
    submissionId: 'submission-200-b',
    resourceServers: [
      {
        id: 'provider-a',
        environment: 'dev',
        services: [
          { name: 'a-service', scopes: [] },
          { name: 'b-service', scopes: ['alpha'] },
        ],
      },
      {
        id: 'provider-z',
        environment: 'dev',
        services: [{ name: 'z-service', scopes: ['read', 'write'] }],
      },
    ],
  });
});

test('does not derive callback metadata from unrelated connections', async () => {
  const { service } = createService({
    connections: [
      existingConnection({
        requesterDetails: {
          ...existingConnection().requesterDetails,
          client: { integrationId: 'integration-b', clientId: 'wrong-client' },
        },
      }),
    ],
  });

  await assert.rejects(
    service.buildIntegrationAllowedServices('integration-a', 'dev', 'approved'),
    /No approved connections found for integration integration-a in environment dev/
  );
});

test('fails closed when one integration resolves to multiple OAuth clients', async () => {
  const { service } = createService({
    connections: [
      existingConnection({ serviceId: 'service-a' }),
      existingConnection({
        id: 'connection-2',
        serviceId: 'service-b',
        requesterDetails: {
          ...existingConnection().requesterDetails,
          client: {
            integrationId: 'integration-a',
            clientId: 'oauth-client-b',
          },
        },
      }),
    ],
  });

  await assert.rejects(
    service.buildIntegrationAllowedServices('integration-a', 'dev', 'approved'),
    /connections for more than one OAuth client/
  );
});
