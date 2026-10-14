import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../clients/oauth.js';
import type {
  BatchResult,
  ConnectionClientGrant,
  ConnectionClientGrantInput,
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
  grants?: Record<string, ConnectionClientGrant[]>;
  subsystems?: SubsystemEntry[];
  upsert?: (org: string, input: ConnectionRequestInput) => Promise<BatchResult>;
  upsertGrant?: (
    org: string,
    connectionId: string,
    input: ConnectionClientGrantInput
  ) => Promise<BatchResult>;
  logger?: FastifyBaseLogger;
}

function createService(options: FakeApiOptions = {}) {
  const writes: Array<{ org: string; input: ConnectionRequestInput }> = [];
  const grantWrites: Array<{
    org: string;
    connectionId: string;
    input: ConnectionClientGrantInput;
  }> = [];
  const catalog = options.catalog || {};
  const api = {
    getOASService: async (name: string) => {
      const service = catalog[name];
      if (!service) throw new Error(`Unexpected catalog lookup: ${name}`);
      return service;
    },
    listConnections: async () => options.connections || [],
    listConnectionClientGrants: async (_org: string, connectionId: string) => {
      if (options.grants) return options.grants[connectionId] || [];
      const connection = (options.connections || []).find(
        (item) => item.id === connectionId
      );
      const details = connection?.requesterDetails;
      return details?.client?.integrationId && details?.client?.clientId
        ? [
            {
              id: `grant-${connectionId}`,
              connection: connectionId,
              integrationId: details.client.integrationId,
              oauthClientId: details.client.clientId,
              submissionId: details.submissionId,
              requesterDetails: details,
              scopes: details.scopes,
              status: connection?.isApproved ? 'approved' : 'pending',
            },
          ]
        : [];
    },
    listCatalogSubsystems: async () =>
      options.subsystems || [consumerSubsystem],
    upsertConnection: async (org: string, input: ConnectionRequestInput) => {
      writes.push({ org, input });
      return options.upsert
        ? options.upsert(org, input)
        : {
            status: 200,
            result: 'updated',
            id:
              (options.connections || []).find(
                (item) =>
                  item.clientId === input.clientId &&
                  item.serviceId === input.serviceId
              )?.id || `connection-${input.serviceId}`,
          };
    },
    upsertConnectionClientGrant: async (
      org: string,
      connectionId: string,
      input: ConnectionClientGrantInput
    ) => {
      grantWrites.push({ org, connectionId, input });
      return options.upsertGrant
        ? options.upsertGrant(org, connectionId, input)
        : { status: 200, result: 'updated', id: `grant-${connectionId}` };
    },
  } as unknown as SdxMemberApiClient;

  const service = new IntegrationAccessService(
    {} as OAuthClient,
    options.logger
  );
  Object.assign(service, { api });
  return { service, writes, grantWrites };
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
    isActive: true,
    requesterDetails: {
      submissionId: 'submission-100-a',
      requester: { name: 'Jane Doe', email: 'jane@example.test' },
      scopes: ['read'],
      client: {
        integrationId: 'integration-a',
        clientId: 'oauth-client-a',
        privacyZone: 'citizen',
      },
      service: {
        clientId: 'provider-a',
        privacyZone: 'health',
        version: '1.0.0',
      },
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
  const { service, writes, grantWrites } = createService({
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
    grantWrites.map(({ connectionId, input }) => ({
      connectionId,
      integrationId: input.integrationId,
      oauthClientId: input.oauthClientId,
      scopes: input.scopes,
    })),
    [
      {
        connectionId: 'connection-empty-service',
        integrationId: 'integration-a',
        oauthClientId: 'oauth-client-a',
        scopes: [],
      },
      {
        connectionId: 'connection-scoped-service',
        integrationId: 'integration-a',
        oauthClientId: 'oauth-client-a',
        scopes: ['read', 'write'],
      },
    ]
  );
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
      'empty-service': 'submitted connection and grant approval request',
      'scoped-service': 'submitted connection and grant approval request',
    },
  });
});

test('awaits a scope update and writes only the exact grant', async () => {
  let releaseWrite!: () => void;
  let signalWriteStarted!: () => void;
  const writeStarted = new Promise<void>((resolve) => {
    signalWriteStarted = resolve;
  });
  const writeGate = new Promise<BatchResult>((resolve) => {
    releaseWrite = () => resolve({ status: 200, result: 'updated' });
  });
  const { service, writes, grantWrites } = createService({
    catalog: { 'service-a': catalogService('service-a', 'provider-a') },
    connections: [existingConnection()],
    upsertGrant: async () => {
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

  assert.deepEqual(writes, []);
  assert.equal(grantWrites.length, 1);
  assert.equal(grantWrites[0].org, 'consumer-org');
  assert.equal(grantWrites[0].connectionId, 'connection-1');
  assert.deepEqual(grantWrites[0].input, {
    integrationId: 'integration-a',
    oauthClientId: 'oauth-client-a',
    submissionId: 'submission-2',
    requesterDetails: {
      submissionId: 'submission-2',
      requester: { name: 'Jane Doe', email: 'jane@example.test' },
      scopes: ['read', 'write'],
      client: {
        integrationId: 'integration-a',
        clientId: 'oauth-client-a',
        privacyZone: 'citizen',
      },
      service: {
        clientId: 'provider-a',
        privacyZone: 'health',
        version: '1.0.0',
      },
    },
    scopes: ['read', 'write'],
  });
  assert.deepEqual(response.results, {
    'service-a': 'updated grant, submitted for re-approval',
  });
});

test('reactivates an approved inactive connection without replacing its metadata', async () => {
  const { service, writes, grantWrites } = createService({
    catalog: { 'service-a': catalogService('service-a', 'provider-a') },
    connections: [existingConnection({ isActive: false })],
  });

  const response = await service.submitIntegrationAccessRequest(
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
  assert.deepEqual(writes[0].input, {
    clientId: 'consumer-subsystem',
    serviceId: 'service-a',
    isApproved: true,
    isActive: true,
  });
  assert.equal(grantWrites.length, 1);
  assert.deepEqual(response.results, {
    'service-a': 'reactivated approved connection',
  });
});

test('adds a later client grant without overwriting the approved shared connection', async () => {
  const { service, writes, grantWrites } = createService({
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

  const response = await service.submitIntegrationAccessRequest(
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

  assert.deepEqual(writes, []);
  assert.equal(grantWrites.length, 1);
  assert.equal(grantWrites[0].connectionId, 'connection-1');
  assert.equal(grantWrites[0].input.integrationId, 'integration-a');
  assert.equal(grantWrites[0].input.oauthClientId, 'oauth-client-a');
  assert.deepEqual(response.results, {
    'service-a': 'submitted grant approval request',
  });
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
          { name: 'a-service', scopes: [], version: '1.0.0' },
          {
            name: 'b-service',
            scopes: ['alpha'],
            version: '1.0.0',
          },
        ],
      },
      {
        id: 'provider-z',
        environment: 'dev',
        services: [
          {
            name: 'z-service',
            scopes: ['read', 'write'],
            version: '1.0.0',
          },
        ],
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
    /No connections found for integration integration-a in environment dev/
  );
});

test('returns an empty callback when exact connections exist but none are active and approved', async () => {
  const { service } = createService({
    connections: [existingConnection({ isActive: false })],
  });

  const response = await service.buildIntegrationAllowedServices(
    'integration-a',
    'dev',
    'approved'
  );

  assert.deepEqual(response, {
    integrationId: 'integration-a',
    clientId: 'oauth-client-a',
    submissionId: 'submission-100-a',
    resourceServers: [],
  });
});

test('keeps apply strict but skips malformed legacy rows during revocation', async () => {
  const warnings: unknown[][] = [];
  const logger = {
    debug: () => undefined,
    warn: (...args: unknown[]) => warnings.push(args),
  } as unknown as FastifyBaseLogger;
  const { service } = createService({
    logger,
    connections: [
      existingConnection({ id: 'valid', serviceId: 'service-a' }),
      existingConnection({
        id: 'malformed',
        serviceId: 'service-b',
        requesterDetails: {
          ...existingConnection().requesterDetails,
          submissionId: 'submission-200-b',
          scopes: undefined as unknown as string[],
        },
      }),
    ],
    catalog: {
      'service-a': catalogService('service-a', 'provider-a'),
      'service-b': catalogService('service-b', 'provider-a'),
    },
  });

  await assert.rejects(
    service.buildIntegrationAllowedServices('integration-a', 'dev', 'approved'),
    /does not contain a valid scope list/
  );

  const response = await service.buildIntegrationAllowedServices(
    'integration-a',
    'dev',
    'approved',
    { skipMalformedConnections: true }
  );

  assert.deepEqual(response, {
    integrationId: 'integration-a',
    clientId: 'oauth-client-a',
    submissionId: 'submission-200-b',
    resourceServers: [
      {
        id: 'provider-a',
        environment: 'dev',
        services: [{ name: 'service-a', scopes: ['read'], version: '1.0.0' }],
      },
    ],
  });
  assert.equal(warnings.length, 1);
  const warning = warnings[0][0] as {
    connectionId: string;
    serviceId: string;
  };
  assert.equal(warning.connectionId, 'malformed');
  assert.equal(warning.serviceId, 'service-b');
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
    /grants for more than one OAuth client/
  );
});
