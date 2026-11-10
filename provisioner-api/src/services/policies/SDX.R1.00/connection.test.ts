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
