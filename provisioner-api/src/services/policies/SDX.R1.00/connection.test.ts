import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PolicyService } from '../../policy-service.js';

for (const policyVersion of ['SDX.R0.00', 'SDX.R1.00']) {
  for (const includeVersion of [false, true]) {
    test(`${policyVersion} accepts approved requester metadata ${includeVersion ? 'with' : 'without'} a pinned service version`, () => {
      const result = new PolicyService().validateConnectionRequest(policyVersion, {
        clientId: 'MIN.CONSUMER.APP', serviceId: 'DEV.MIN.PROVIDER.API.v1',
        environment: 'dev', isApproved: true, isActive: true, policyVersion,
        requesterDetails: {
          submissionId: 'submission-1', requester: { name: 'Local requester' },
          scopes: ['demo.read'],
          client: { integrationId: 'integration-1', clientId: 'oauth-client', privacyZone: 'local' },
          service: { clientId: 'MIN.PROVIDER.API', ...(includeVersion ? { version: '1.0.0' } : {}) },
        },
        clientResources: { gatewayPatterns: { 'sdx-p2p-consumer-access.r1': {}, 'sdx-p2p-consumer.r1': { upgrades: {} } } },
        combinedScopes: ['demo.read'], action: 'apply',
        globals: { environment: {
          client_id: 'provisioner', oauth_token_url: 'https://issuer.example/token',
          kong_admin_url: 'http://kong-admin', gwa_api_url: 'http://gwa/v2',
          operator_edge_url: 'http://edge', ca_token_url: 'http://ca', public_url: 'http://edge',
        } },
      });
      assert.equal(result.allowed, true, JSON.stringify(result));
      assert.equal(result.decision, 'allow');
    });
  }
}

test('R1 still denies an unapproved request with a pinned service version', () => {
  const result = new PolicyService().validateConnectionRequest('SDX.R1.00', {
    clientId: 'MIN.CONSUMER.APP', serviceId: 'DEV.MIN.PROVIDER.API.v1',
    environment: 'dev', isApproved: false, policyVersion: 'SDX.R1.00',
    requesterDetails: {
      submissionId: 'submission-1', requester: { name: 'Local requester' },
      scopes: ['demo.read'],
      client: { integrationId: 'integration-1', clientId: 'oauth-client', privacyZone: 'local' },
      service: { clientId: 'MIN.PROVIDER.API', version: '1.0.0' },
    },
    clientResources: { gatewayPatterns: { 'sdx-p2p-consumer-access.r1': {}, 'sdx-p2p-consumer.r1': { upgrades: {} } } },
    combinedScopes: ['demo.read'], action: 'apply',
    globals: { environment: {
      client_id: 'provisioner', oauth_token_url: 'https://issuer.example/token',
      kong_admin_url: 'http://kong-admin', gwa_api_url: 'http://gwa/v2',
      operator_edge_url: 'http://edge', ca_token_url: 'http://ca', public_url: 'http://edge',
    } },
  });
  assert.equal(result.decision, 'deny', JSON.stringify(result));
});
