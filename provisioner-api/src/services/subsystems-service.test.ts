import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../clients/oauth.js';
import type {
  SdxMemberApiClient,
  SubsystemEntry,
} from '../clients/sdx-member/index.js';
import { SdxMemberService } from './subsystems-service.js';

function subsystem(
  clientId: string,
  integrationClientIds: string[]
): SubsystemEntry {
  return {
    name: clientId,
    clientId,
    integrationClientIds,
    organization: { name: 'consumer-org' },
  };
}

function createService(subsystems: SubsystemEntry[]) {
  const warnings: unknown[][] = [];
  const logger = {
    warn: (...args: unknown[]) => warnings.push(args),
  } as unknown as FastifyBaseLogger;
  const service = new SdxMemberService({} as OAuthClient, logger);
  Object.assign(service, {
    api: {
      listCatalogSubsystems: async () => subsystems,
    } as unknown as SdxMemberApiClient,
  });
  return { service, warnings };
}

test('selects the exact integration mapping from the catalog response', async () => {
  const { service } = createService([
    subsystem('subsystem-a', ['integration-a']),
    subsystem('subsystem-b', ['integration-b']),
  ]);

  const result =
    await service.getSubsystemByIntegrationClientId('integration-b');

  assert.equal(result.clientId, 'subsystem-b');
});

test('warns and uses deterministic subsystem ID order when duplicate untimestamped mappings exist', async () => {
  const { service, warnings } = createService([
    subsystem('subsystem-a', ['integration-a']),
    subsystem('subsystem-z', ['integration-a']),
  ]);

  const result =
    await service.getSubsystemByIntegrationClientId('integration-a');

  assert.equal(result.clientId, 'subsystem-z');
  assert.equal(warnings.length, 1);
  assert.deepEqual(warnings[0][0], {
    integrationClientId: 'integration-a',
    selectedSubsystemId: 'subsystem-z',
    ignoredSubsystemIds: ['subsystem-a'],
    selection: 'deterministic-subsystem-id',
  });
});

test('does not use a subsystem whose authoritative mapping differs', async () => {
  const { service } = createService([
    subsystem('subsystem-a', ['integration-b']),
  ]);

  await assert.rejects(
    service.getSubsystemByIntegrationClientId('integration-a'),
    /not found/
  );
  assert.deepEqual(await service.getIntegrationStatus('integration-a'), {
    status: 'unregistered',
  });
});
