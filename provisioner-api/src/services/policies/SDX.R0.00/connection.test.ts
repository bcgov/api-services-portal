import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PolicyService } from '../../policy-service.js';

test('allows a fully configured R0 privacy-zone token-exchange request', () => {
  const result = new PolicyService().validateConnectionRequest('SDX.R0.00', {
    clientId: 'MIN.CITZ.EXAMPLE-UI',
    serviceId: 'APSTST.MIN.EXAMPLE.SERVICE.v0',
    environment: 'apstst',
    isApproved: false,
    isActive: false,
    policyVersion: 'SDX.R0.00',
    requesterDetails: {
      submissionId: 'sanitized-test-run',
      requester: {
        name: 'approved-requester-reference',
      },
      scopes: ['example:read', 'example:create'],
      client: {
        integrationId: 'consumer-browser-client',
        clientId: 'consumer-browser-client',
        privacyZone: 'urn:example:consumer:privacy-zone',
      },
      service: {
        clientId: 'MIN.EXAMPLE.RESOURCE-SERVER',
        privacyZone: 'urn:example:provider:privacy-zone',
      },
    },
    clientResources: {
      gatewayPatterns: {
        'sdx-p2p-consumer-access.r1': {
          integrationClientId: 'consumer-browser-client',
        },
        'sdx-p2p-consumer.r1': {
          stripPath: false,
          clientRuntimeOverride: 'MIN.EXAMPLE.pzgw',
          upgrades: {
            sign: {},
            verify: {},
            token: {
              allowedAud: 'consumer-browser-client',
              allowedIss: ['https://issuer.example/realms/standard'],
              consumerMatch: true,
              consumerMatchClaim: 'azp',
              consumerMatchClaimCustomId: true,
            },
            acl: {},
            tokenExchange: {
              clientId: 'runtime-token-exchange-client',
              tokenEndpoint: 'https://issuer.example/realms/standard/token',
              scopes: [
                'example:read',
                'example:create',
                'urn:example:provider:privacy-zone',
              ],
              audience: 'MIN.EXAMPLE.RESOURCE-SERVER',
            },
          },
        },
      },
    },
    serviceResources: {
      gatewayPatterns: {
        'sdx-p2p-provider.r1': {
          upstreamUrl: 'http://provider-api.example/sdx/api/v1',
          useSni: 'true',
          upgrades: {
            mtlsAuth: {},
            mtlsAcl: {},
            sign: {},
            verify: {},
            token: {
              allowedAud: 'MIN.EXAMPLE.RESOURCE-SERVER',
              allowedIss: ['https://issuer.example/realms/standard'],
              consumerMatch: false,
            },
          },
        },
      },
    },
    combinedScopes: ['example:read', 'example:create'],
    action: 'CREATE',
    globals: {
      environment: {
        client_id: 'sdx-provisioner',
        oauth_token_url: 'https://aps.example/oauth/token',
        kong_admin_url: 'http://kong-admin.example',
        gwa_api_url: 'https://gwa.example',
        operator_edge_url: 'https://operator.example',
        ca_token_url: 'https://ca.example/token',
        public_url: 'https://portal.example',
      },
    },
  });

  assert.equal(result.allowed, true, result.errors.join('; '));
  assert.equal(result.decision, 'allow');
});
