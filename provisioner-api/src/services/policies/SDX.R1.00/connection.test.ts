import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ServiceCatalogEntry } from '../../../clients/sdx-member/index.js';
import { PolicyService } from '../../policy-service.js';

function connectionContext(policyVersion: string, includeVersion: boolean) {
  const environment = {
    client_id: 'provisioner',
    oauth_token_url: 'https://issuer.example/token',
    kong_admin_url: 'http://kong-admin',
    gwa_api_url: 'http://gwa/v2',
    operator_edge_url: 'http://edge',
    ca_token_url: 'http://ca',
    public_url: 'http://edge',
    client_runtime_override: 'MIN.CITZ.pzgw',
    sdx_token_exchange_client_id: 'sdx-edge-exchange',
    sdx_token_exchange_token_url: 'https://issuer.example/token',
    sdx_trusted_issuers: ['https://issuer.example'],
  };
  const service: ServiceCatalogEntry = {
    name: 'DEV.MIN.PROVIDER.API.v1',
    title: 'Provider API',
    version: '1.0.0',
    description: 'Provider API',
    environment: 'dev',
    operations: [],
    subsystem: {
      name: 'PROVIDER',
      clientId: 'MIN.PROVIDER.API',
      privacyZone: 'urn:ca:bc:gov:provider',
      integrationClientIds: [],
    },
  };
  const requesterDetails = {
    submissionId: 'submission-1',
    requester: { name: 'Local requester' },
    scopes: ['demo.read'],
    client: {
      integrationId: 'integration-1',
      clientId: 'oauth-client',
      privacyZone: 'local',
    },
    service: {
      clientId: service.subsystem.clientId,
      privacyZone: service.subsystem.privacyZone,
      ...(includeVersion ? { version: '1.0.0' } : {}),
    },
  };
  const managedApplicationScopes = ['demo.read'];
  // Apply the same managed security settings as production before Cedar validation.
  const resources = new PolicyService().enforceConnectionResources(
    policyVersion,
    {
      environment: 'dev',
      environmentConfig: environment,
      service,
      requesterDetails,
      managedApplicationScopes,
    },
    {
      clientResources: {
        gatewayPatterns: {
          'sdx-p2p-consumer-access.r1': {},
          'sdx-p2p-consumer.r1': { upgrades: {} },
        },
      },
      serviceResources: {
        gatewayPatterns: { 'sdx-p2p-provider.r1': { upgrades: {} } },
      },
    }
  );
  return {
    clientId: 'MIN.CONSUMER.APP',
    serviceId: service.name,
    environment: 'dev',
    isApproved: true,
    isActive: true,
    policyVersion,
    requesterDetails,
    ...resources,
    combinedScopes: ['demo.read'],
    action: 'apply',
    globals: {
      environment,
      ...(policyVersion === 'SDX.R1.00' ? { managedApplicationScopes } : {}),
    },
  };
}

for (const policyVersion of ['SDX.R0.00', 'SDX.R1.00']) {
  for (const includeVersion of [false, true]) {
    test(`${policyVersion} accepts approved requester metadata ${
      includeVersion ? 'with' : 'without'
    } a pinned service version`, () => {
      const result = new PolicyService().validateConnectionRequest(
        policyVersion,
        connectionContext(policyVersion, includeVersion)
      );
      assert.equal(result.allowed, true, JSON.stringify(result));
      assert.equal(result.decision, 'allow');
    });
  }
}

test('R1 still denies an unapproved request with a pinned service version', () => {
  const context = connectionContext('SDX.R1.00', true);
  const policy = new PolicyService();
  // First prove this fixture satisfies every other policy requirement.
  const approved = policy.validateConnectionRequest('SDX.R1.00', context);
  assert.equal(approved.allowed, true, JSON.stringify(approved));
  const result = policy.validateConnectionRequest('SDX.R1.00', {
    ...context,
    isApproved: false,
  });
  assert.equal(result.decision, 'deny', JSON.stringify(result));
});

// Exercise the provisioner entry point with real Cedar evaluation: submitted
// customizations must not be repaired by resource enforcement before validation.
test('connection changes evaluate submitted resources without reapplying defaults', async () => {
  const { mkdtempSync, writeFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { resetEnvironmentsCache } = await import(
    '../../../config/environments.js'
  );
  const { PatternsEvaluatorService } = await import(
    '../../patterns-evaluator.js'
  );
  const context = connectionContext('SDX.R1.00', true);
  const directory = mkdtempSync(join(tmpdir(), 'connection-policy-'));
  const previousPath = process.env.ENVIRONMENTS_CONFIG_FILE;
  process.env.ENVIRONMENTS_CONFIG_FILE = join(directory, 'environments.json');
  writeFileSync(
    process.env.ENVIRONMENTS_CONFIG_FILE,
    JSON.stringify({ dev: context.globals.environment })
  );
  resetEnvironmentsCache();
  try {
    const policy = new PolicyService();
    // Any attempt to regenerate defaults or enforce resources on updates fails.
    policy.getDefaultResources = () => {
      throw new Error('Unexpected defaults');
    };
    policy.enforceConnectionResources = () => {
      throw new Error('Unexpected resource enforcement');
    };
    const evaluator = new PatternsEvaluatorService(
      policy,
      {
        listCatalogScopes: async () => [
          { name: 'demo.read', services: [{ environment: 'dev' }] },
        ],
      } as any,
      {} as any
    );
    let generated = 0;
    evaluator.buildResourcesUsingPattern = async () => {
      generated++;
      return { documents: [] };
    };
    const service = {
      name: context.serviceId,
      environment: 'dev',
      subsystem: {
        clientId: context.requesterDetails.service.clientId,
        privacyZone: context.requesterDetails.service.privacyZone,
      },
    } as ServiceCatalogEntry;
    const { globals, combinedScopes, action: _action, ...connection } = context;
    for (const action of ['preview', 'apply', 'diff'] as const) {
      await evaluator.buildResourcesUsingConnectionRequest(
        'connection-1',
        action,
        service,
        connection
      );
      const allowedCustomization = structuredClone(connection);
      (
        allowedCustomization.clientResources.gatewayPatterns[
          'sdx-p2p-consumer.r1'
        ] as any
      ).upgrades.sign = {};
      const submitted = structuredClone(allowedCustomization);
      await evaluator.buildResourcesUsingConnectionRequest(
        'connection-1',
        action,
        service,
        allowedCustomization
      );
      assert.deepEqual(allowedCustomization, submitted);
      for (const tokenExchange of [null, false, {}]) {
        const customized = structuredClone(connection);
        (
          customized.clientResources.gatewayPatterns[
            'sdx-p2p-consumer.r1'
          ] as any
        ).upgrades.tokenExchange = tokenExchange;
        await assert.rejects(
          evaluator.buildResourcesUsingConnectionRequest(
            'connection-1',
            action,
            service,
            customized
          ),
          /not allowed by 'SDX.R1.00' policy/
        );
      }
      for (const upgrade of ['tokenExchange', 'token', 'acl']) {
        const customized = structuredClone(connection);
        delete (
          customized.clientResources.gatewayPatterns[
            'sdx-p2p-consumer.r1'
          ] as any
        ).upgrades[upgrade];
        const before = structuredClone(customized);
        generated = 0;
        await assert.rejects(
          evaluator.buildResourcesUsingConnectionRequest(
            'connection-1',
            action,
            service,
            customized
          ),
          /not allowed by 'SDX.R1.00' policy/
        );
        assert.equal(
          generated,
          0,
          'Policy rejection must precede resource generation'
        );
        assert.deepEqual(
          customized,
          before,
          'Submitted resources must remain unchanged'
        );
      }
    }
    // Deletion remains possible even if the stored connection no longer meets policy.
    const removed = structuredClone(connection);
    delete (
      removed.clientResources.gatewayPatterns['sdx-p2p-consumer.r1'] as any
    ).upgrades.tokenExchange;
    await evaluator.buildResourcesUsingConnectionRequest(
      'connection-1',
      'delete',
      service,
      removed
    );
  } finally {
    if (previousPath === undefined) delete process.env.ENVIRONMENTS_CONFIG_FILE;
    else process.env.ENVIRONMENTS_CONFIG_FILE = previousPath;
    resetEnvironmentsCache();
    rmSync(directory, { recursive: true, force: true });
  }
});
