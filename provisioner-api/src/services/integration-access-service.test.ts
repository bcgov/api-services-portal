import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../clients/oauth.js';
import type {
  BatchResult,
  ConnectionRequest,
  ConnectionRequestInput,
  ResourceScopeEntry,
  SdxMemberApiClient,
  ServiceCatalogEntry,
  SubsystemEntry,
} from '../clients/sdx-member/index.js';
import type { TNewIntegrationAccessRequest } from '../schemas/sdx.js';
import { IntegrationAccessService } from './integration-access-service.js';
import { resetEnvironmentsCache } from '../config/environments.js';

let environmentDirectory: string;
let previousEnvironmentPath: string | undefined;

before(() => {
  environmentDirectory = mkdtempSync(join(tmpdir(), 'aps-4995-access-'));
  const configPath = join(environmentDirectory, 'environments.json');
  writeFileSync(
    configPath,
    JSON.stringify({
      dev: {
        oauth_token_url: 'https://issuer.example/token',
        kong_admin_url: 'http://kong-admin',
        sdx_token_exchange_client_id: 'sdx-edge-exchange',
        sdx_token_exchange_token_url: 'https://issuer.example/token',
        sdx_trusted_issuers: ['https://issuer.example'],
      },
    })
  );
  previousEnvironmentPath = process.env.ENVIRONMENTS_CONFIG_FILE;
  process.env.ENVIRONMENTS_CONFIG_FILE = configPath;
  resetEnvironmentsCache();
});

after(() => {
  if (previousEnvironmentPath === undefined) {
    delete process.env.ENVIRONMENTS_CONFIG_FILE;
  } else {
    process.env.ENVIRONMENTS_CONFIG_FILE = previousEnvironmentPath;
  }
  resetEnvironmentsCache();
  rmSync(environmentDirectory, { recursive: true, force: true });
});

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
  logger?: FastifyBaseLogger;
  scopeCatalog?: ResourceScopeEntry[];
}

function scopeCatalogForServices(
  services: ServiceCatalogEntry[]
): ResourceScopeEntry[] {
  const entries = new Map<string, ResourceScopeEntry>();
  for (const service of services) {
    for (const operation of service.operations) {
      for (const scope of operation.scopes || []) {
        if (typeof scope === 'string') continue;
        const existing = entries.get(scope.name) || {
          name: scope.name,
          description: scope.description,
          services: [],
        };
        if (!existing.services.some((entry) => entry.name === service.name)) {
          existing.services.push({
            name: service.name,
            environment: service.environment,
            version: service.version,
          });
        }
        entries.set(scope.name, existing);
      }
    }
  }
  return Array.from(entries.values());
}

function createService(options: FakeApiOptions = {}) {
  const writes: Array<{ org: string; input: ConnectionRequestInput }> = [];
  const catalog = options.catalog || {};
  const api = {
    listCatalogScopes: async () =>
      options.scopeCatalog || scopeCatalogForServices(Object.values(catalog)),
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

  const service = new IntegrationAccessService(
    {} as OAuthClient,
    options.logger
  );
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
  assert.deepEqual(
    writes.map(
      ({ input }) =>
        (input.clientResources as any).gatewayPatterns['sdx-p2p-consumer.r1']
          .upgrades.tokenExchange.scopes
    ),
    [
      ['read', 'write'],
      ['read', 'write'],
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
    isActive: false,
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
  });
  assert.deepEqual(response.results, {
    'service-a': 'updated scopes, submitted for re-approval',
  });
});

test('reactivates an approved inactive connection on an exact resubmission', async () => {
  const { service, writes } = createService({
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
    requesterDetails: {
      submissionId: 'submission-2',
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
  });
  assert.deepEqual(response.results, {
    'service-a': 'reactivated approved connection',
  });
});

test('fails closed rather than replacing the one-to-one client mapping', async () => {
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
    /already associated with integration 'integration-b' and OAuth client 'oauth-client-b'/
  );
  assert.deepEqual(writes, []);
});

test('fails closed when existing connections contain conflicting client identities', async () => {
  const { service, writes } = createService({
    catalog: { 'service-a': catalogService('service-a', 'provider-a') },
    connections: [
      existingConnection({
        id: 'connection-a',
        serviceId: 'service-a',
      }),
      existingConnection({
        id: 'connection-b',
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
    /connections for more than one integration or OAuth client/
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

test('returns an empty callback when the integration has connections only in another environment', async () => {
  const { service } = createService({
    connections: [
      existingConnection({
        environment: 'apsdev',
        requesterDetails: {
          ...existingConnection().requesterDetails,
          submissionId: 'submission-apsdev',
        },
      }),
    ],
  });

  const response = await service.buildIntegrationAllowedServices(
    'integration-a',
    'apstst',
    'approved'
  );

  assert.deepEqual(response, {
    integrationId: 'integration-a',
    clientId: 'oauth-client-a',
    submissionId: 'submission-apsdev',
    resourceServers: [],
  });
});

for (const isActive of [false, true]) {
  test(`approved access includes the reviewed provider grant when isActive=${isActive}`, async () => {
    const { service } = createService({
      connections: [existingConnection({ isActive })],
      catalog: { 'service-a': catalogService('service-a', 'provider-a') },
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
      resourceServers: [
        {
          id: 'provider-a',
          environment: 'dev',
          services: [{ name: 'service-a', version: '1.0.0', scopes: ['read'] }],
        },
      ],
    });
  });
  test(`unapproved access has no approved grant when isActive=${isActive}`, async () => {
    const { service } = createService({
      connections: [existingConnection({ isApproved: false, isActive })],
    });
    const response = await service.buildIntegrationAllowedServices(
      'integration-a',
      'dev',
      'approved'
    );
    assert.deepEqual(response.resourceServers, []);
  });
}

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
      existingConnection({
        id: 'connection-1',
        serviceId: 'service-a',
      }),
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
    /connections for more than one integration or OAuth client/
  );
});

test('rejects a second OAuth client for another service in the same subsystem environment', async () => {
  const { service, writes } = createService({
    catalog: { 'service-b': catalogService('service-b', 'provider-a') },
    connections: [
      existingConnection({
        serviceId: 'service-a',
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
    service.submitIntegrationAccessRequest(
      'submission-2',
      consumerSubsystem,
      'integration-a',
      accessRequest([
        {
          id: 'provider-a',
          environment: 'dev',
          services: [{ name: 'service-b', scopes: ['read'] }],
        },
      ])
    ),
    /already associated with integration 'integration-a' and OAuth client 'oauth-client-b'/
  );
  assert.deepEqual(writes, []);
});
