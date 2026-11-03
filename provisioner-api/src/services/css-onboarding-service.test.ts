import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import type { OAuthClient } from '../clients/oauth.js';
import type {
  ConnectionRequestInput,
  ServiceCatalogEntry,
  SubsystemEntry,
} from '../clients/sdx-member/index.js';
import type { TaskFeedRecord } from '../clients/feed/types.js';
import { IntegrationController } from '../controllers/integration-controller.js';
import { NotFoundError } from '../errors/api-errors.js';
import { resetEnvironmentsCache } from '../config/environments.js';
import type { TNewIntegrationAccessRequest } from '../schemas/sdx.js';
import { IntegrationAccessService } from './integration-access-service.js';
import { CssOnboardingService } from './css-onboarding-service.js';
import type { Services } from './index.js';

let environmentDirectory: string;
let previousEnvironmentPath: string | undefined;

before(() => {
  environmentDirectory = mkdtempSync(join(tmpdir(), 'css-onboarding-'));
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

const subsystem: SubsystemEntry = {
  name: 'Consumer',
  clientId: 'consumer-subsystem',
  integrationClientIds: ['integration-a'],
  organization: { name: 'consumer-org' },
  privacyZone: 'citizen',
};

function catalogService(
  name: string,
  providerId = 'provider-a'
): ServiceCatalogEntry {
  return {
    name,
    title: name,
    version: '1.0.0',
    description: `${name} service`,
    environment: 'dev',
    operations: [
      {
        path: '/resource',
        method: 'get',
        summary: 'Get resource',
        operationId: `get-${name}`,
        scopes: [{ name: 'read' }, { name: 'write' }],
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
  serviceNames: string[] = ['service-a', 'service-b'],
  overrides: Partial<TNewIntegrationAccessRequest> = {}
): TNewIntegrationAccessRequest {
  return {
    requester: { displayName: 'Jane Doe', email: 'jane@example.gov.bc.ca' },
    clientId: 'oauth-client-a',
    policyVersion: 'SDX.R1.00',
    privacyZone: 'citizen',
    resourceServers: [
      {
        id: 'provider-a',
        environment: 'dev',
        services: serviceNames.map((name) => ({ name, scopes: ['read'] })),
      },
    ],
    ...overrides,
  };
}

function setup() {
  const tasks = new Map<string, TaskFeedRecord>();
  const puts: TaskFeedRecord[] = [];
  const writes: Array<{ org: string; input: ConnectionRequestInput }> = [];
  const activities: Array<Record<string, unknown>> = [];
  const catalogReads: string[] = [];
  let connectionReads = 0;
  let subsystemLookups = 0;
  let registration: 'registered' | 'unregistered' = 'unregistered';

  const catalog: Record<string, ServiceCatalogEntry> = {
    'service-a': catalogService('service-a'),
    'service-b': catalogService('service-b'),
  };
  const api = {
    getOASService: async (name: string) => {
      catalogReads.push(name);
      const service = catalog[name];
      if (!service) {
        throw new NotFoundError(`Service ${name} was not found`);
      }
      return service;
    },
    listConnections: async () => {
      connectionReads += 1;
      return [];
    },
    upsertConnection: async (org: string, input: ConnectionRequestInput) => {
      writes.push({ org, input });
      return { status: 200, result: 'created' };
    },
    listCatalogSubsystems: async () => {
      throw new Error('catalog subsystem lookup is not used by onboarding');
    },
  };

  const integrationAccess = new IntegrationAccessService({} as OAuthClient);
  Object.assign(integrationAccess, { api });

  const sdxMember = {
    getIntegrationStatus: async () =>
      registration === 'registered'
        ? {
            status: 'registered' as const,
            id: subsystem.clientId,
            name: subsystem.name,
            organization: 'consumer-org',
            description: '',
          }
        : { status: 'unregistered' as const },
    getSubsystemByIntegrationClientId: async () => {
      subsystemLookups += 1;
      if (registration !== 'registered') {
        throw new Error('subsystem lookup is not allowed before registration');
      }
      return subsystem;
    },
  };

  const feed = {
    getTaskByRef: async (ref: string) => tasks.get(ref),
    putTask: async (task: TaskFeedRecord) => {
      const stored = structuredClone(task);
      puts.push(stored);
      tasks.set(task.ref, stored);
      return { status: 200, result: 'updated' };
    },
  };

  const services = {
    sdxMember,
    integrationAccess,
    cssOnboarding: new CssOnboardingService(
      feed,
      integrationAccess,
      sdxMember as never,
      undefined
    ),
    activity: {
      publishActivity: async (entry: Record<string, unknown>) => {
        activities.push(entry);
      },
    },
  } as unknown as Services;

  return {
    controller: new IntegrationController(services),
    tasks,
    puts,
    writes,
    activities,
    catalogReads,
    get connectionReads() {
      return connectionReads;
    },
    get subsystemLookups() {
      return subsystemLookups;
    },
    register() {
      registration = 'registered';
    },
  };
}

async function expectStatus(
  promise: Promise<unknown>,
  status: number,
  pattern: RegExp
) {
  await assert.rejects(promise, (err: unknown) => {
    assert.ok(err instanceof Error);
    assert.equal((err as { statusCode?: number }).statusCode, status);
    assert.match(err.message, pattern);
    return true;
  });
}

test('unregistered integration is held and does not upsert connections', async () => {
  const ctx = setup();
  const request = accessRequest();

  const response = await ctx.controller.createIntegrationAccessRequest({
    integrationId: 'integration-a',
    request,
  });

  assert.deepEqual(response.results, {
    'service-a': 'held for onboarding',
    'service-b': 'held for onboarding',
  });
  assert.equal(ctx.tasks.size, 1);
  assert.equal(ctx.puts.length, 1);
  assert.equal(ctx.writes.length, 0);
  assert.equal(ctx.connectionReads, 0);
  assert.equal(ctx.subsystemLookups, 0);
  assert.deepEqual(ctx.catalogReads.sort(), ['service-a', 'service-b']);

  const task = ctx.tasks.get('css-onboarding:integration-a');
  assert.ok(task);
  assert.equal(task.type, 'integrationAccessRequest-subsystemLinking');
  assert.equal(task.status, 'pending');
  assert.equal(task.title, 'Onboard integration-a (Jane Doe)');
  assert.deepEqual(task.jsonBlob, {
    integrationId: 'integration-a',
    submissionId: response.submissionId,
    request,
  });
  assert.equal(ctx.activities.length, 1);
  assert.equal(ctx.activities[0].result, 'success');
  assert.equal(ctx.activities[0].filterKey1, undefined);
  assert.match(
    String(ctx.activities[0].message),
    /integration-a held for onboarding/
  );
});

test('a second submission updates the same task', async () => {
  const ctx = setup();
  const first = await ctx.controller.createIntegrationAccessRequest({
    integrationId: 'integration-a',
    request: accessRequest(['service-a']),
  });
  const revised = accessRequest(['service-a'], {
    requester: { displayName: 'Janet Doe', email: 'janet@example.gov.bc.ca' },
  });
  const second = await ctx.controller.createIntegrationAccessRequest({
    integrationId: 'integration-a',
    request: revised,
  });

  assert.notEqual(first.submissionId, second.submissionId);
  assert.equal(ctx.tasks.size, 1);
  assert.equal(ctx.puts.length, 2);
  assert.equal(ctx.writes.length, 0);
  const task = ctx.tasks.get('css-onboarding:integration-a');
  assert.equal(task?.title, 'Onboard integration-a (Janet Doe)');
  assert.equal(task?.status, 'pending');
  assert.deepEqual(task?.jsonBlob, {
    integrationId: 'integration-a',
    submissionId: second.submissionId,
    request: revised,
  });
});

test('unknown service or policy returns 400 and writes no task', async () => {
  const ctx = setup();
  ctx.tasks.set('css-onboarding:integration-a', {
    ref: 'css-onboarding:integration-a',
    title: 'keep me',
    type: 'integrationAccessRequest-subsystemLinking',
    status: 'pending',
    jsonBlob: { submissionId: 'original' },
  });

  await expectStatus(
    ctx.controller.createIntegrationAccessRequest({
      integrationId: 'integration-a',
      request: accessRequest(['missing-service']),
    }),
    400,
    /missing-service/
  );
  await expectStatus(
    ctx.controller.createIntegrationAccessRequest({
      integrationId: 'integration-a',
      request: accessRequest(['service-a'], { policyVersion: 'SDX.UNKNOWN' }),
    }),
    400,
    /SDX.UNKNOWN not found in registry/
  );

  assert.equal(ctx.puts.length, 0);
  assert.equal(ctx.writes.length, 0);
  assert.deepEqual(ctx.catalogReads, ['missing-service']);
  assert.equal(
    (ctx.tasks.get('css-onboarding:integration-a')?.jsonBlob as { submissionId?: string })
      .submissionId,
    'original'
  );
  assert.equal(ctx.activities.at(-1)?.result, 'failed');
});

test('registered integration still submits connections', async () => {
  const ctx = setup();
  ctx.register();

  const response = await ctx.controller.createIntegrationAccessRequest({
    integrationId: 'integration-a',
    request: accessRequest(['service-a']),
  });

  assert.equal(response.results['service-a'], 'submitted approval request');
  assert.equal(ctx.tasks.size, 0);
  assert.equal(ctx.writes.length, 1);
  assert.equal(ctx.writes[0].org, 'consumer-org');
  assert.equal(ctx.activities[0].filterKey1, 'org:consumer-org');
  assert.equal(ctx.activities[0].result, 'success');
});

test('complete submits the stored request only after registration', async () => {
  const ctx = setup();
  const request = accessRequest(['service-a']);
  const held = await ctx.controller.createIntegrationAccessRequest({
    integrationId: 'integration-a',
    request,
  });

  await expectStatus(
    ctx.controller.completeIntegrationOnboarding({
      integrationId: 'integration-a',
    }),
    409,
    /not registered/
  );
  assert.equal(ctx.writes.length, 0);
  assert.equal(ctx.subsystemLookups, 0);
  assert.equal(ctx.tasks.get('css-onboarding:integration-a')?.status, 'pending');

  ctx.register();
  const completed = await ctx.controller.completeIntegrationOnboarding({
    integrationId: 'integration-a',
  });

  assert.equal(completed.submissionId, held.submissionId);
  assert.equal(completed.results['service-a'], 'submitted approval request');
  assert.equal(ctx.writes.length, 1);
  assert.equal(
    ctx.writes[0].input.requesterDetails?.submissionId,
    held.submissionId
  );
  assert.deepEqual(ctx.writes[0].input.requesterDetails?.scopes, ['read']);
  assert.equal(
    ctx.writes[0].input.requesterDetails?.client?.integrationId,
    'integration-a'
  );
  assert.equal(
    ctx.writes[0].input.requesterDetails?.client?.clientId,
    'oauth-client-a'
  );
  const task = ctx.tasks.get('css-onboarding:integration-a');
  assert.equal(task?.status, 'processed');
  assert.deepEqual(
    (task?.jsonBlob as { request?: unknown; results?: unknown }).request,
    request
  );
  assert.deepEqual(
    (task?.jsonBlob as { results?: unknown }).results,
    completed
  );

  assert.equal(
    ctx.activities.filter((entry) => entry.filterKey1 === 'org:consumer-org')
      .length,
    1
  );

  const again = await ctx.controller.completeIntegrationOnboarding({
    integrationId: 'integration-a',
  });
  assert.deepEqual(again, completed);
  assert.equal(ctx.writes.length, 1);
  assert.equal(ctx.puts.length, 2);
  assert.equal(
    ctx.activities.filter((entry) => entry.filterKey1 === 'org:consumer-org')
      .length,
    1
  );
});

test('complete without a task returns 404', async () => {
  const ctx = setup();
  await expectStatus(
    ctx.controller.completeIntegrationOnboarding({
      integrationId: 'integration-a',
    }),
    404,
    /not found/
  );
  assert.equal(ctx.writes.length, 0);
});
