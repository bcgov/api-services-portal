import assert from 'node:assert/strict';
import { test } from 'node:test';
import type {
  ServiceCatalogEntry,
  SubsystemEntry,
} from '../../../clients/sdx-member/index.js';
import type { EnvironmentConfig } from '../../../config/environments.js';
import type { PolicyRequesterDetails } from '../types.js';
import { PolicyService } from '../../policy-service.js';
import { SDXPolicy } from './index.js';
import { buildR1SecurityConfig } from './security-config.js';

const environment: EnvironmentConfig = {
  client_id: 'control-plane-client',
  oauth_token_url: 'https://control.example/realms/aps/token',
  kong_admin_url: 'http://kong-admin',
  sdx_token_exchange_client_id: 'sdx-edge-exchange',
  sdx_token_exchange_token_url:
    'https://ISSUER.EXAMPLE:443/realms/standard/protocol/openid-connect/token/',
  sdx_trusted_issuers: [
    'https://issuer.example/realms/standard/',
    'https://ISSUER.EXAMPLE:443/realms/standard',
  ],
};

const providerSubsystem: SubsystemEntry = {
  name: 'PROVIDER',
  clientId: 'MIN.PROVIDER.API',
  privacyZone: 'urn:ca:bc:gov:provider',
  integrationClientIds: [],
};

const service: ServiceCatalogEntry = {
  name: 'DEV.MIN.PROVIDER.SERVICE.v1',
  title: 'Provider service',
  version: '1',
  description: 'A provider service',
  environment: 'dev',
  operations: [],
  subsystem: providerSubsystem,
};

const requesterDetails: PolicyRequesterDetails = {
  submissionId: 'submission-1',
  requester: { name: 'Requester' },
  scopes: ['service:read', 'service:read'],
  client: {
    integrationId: 'integration-1',
    clientId: 'application-client',
    privacyZone: 'urn:ca:bc:gov:consumer',
  },
  service: {
    clientId: 'MIN.PROVIDER.API',
    privacyZone: 'urn:ca:bc:gov:provider',
  },
};

test('builds canonical R1 security settings from trusted sources', () => {
  assert.deepEqual(
    buildR1SecurityConfig({
      environment: 'dev',
      environmentConfig: environment,
      service,
      requesterDetails,
    }),
    {
      consumer: {
        token: {
          allowedAud: 'sdx-edge-exchange',
          allowedIss: ['https://issuer.example/realms/standard'],
          consumerMatch: true,
          consumerMatchClaim: 'azp',
          consumerMatchClaimCustomId: true,
          consumerMatchIgnoreNotFound: false,
        },
        acl: {},
        tokenExchange: {
          clientId: 'sdx-edge-exchange',
          tokenEndpoint:
            'https://issuer.example/realms/standard/protocol/openid-connect/token',
          scopes: [],
          audience: 'MIN.PROVIDER.API',
        },
      },
      provider: {
        token: {
          allowedAud: 'MIN.PROVIDER.API',
          allowedIss: ['https://issuer.example/realms/standard'],
          consumerMatch: false,
        },
      },
    }
  );
});

test('uses the exchange client as the required incoming subject-token audience', () => {
  const result = buildR1SecurityConfig({
    environment: 'dev',
    environmentConfig: environment,
    service,
    requesterDetails,
  });

  assert.equal(result.consumer.token.allowedAud, 'sdx-edge-exchange');
  assert.notEqual(
    result.consumer.token.allowedAud,
    requesterDetails.client?.clientId
  );
  assert.notEqual(result.consumer.token.allowedAud, service.subsystem?.clientId);
});

test('R1 preflight requires the explicit client, endpoint, and trusted issuers', () => {
  assert.throws(
    () =>
      new PolicyService().preflightConnectionRequest('SDX.R1.00', {
        environment: 'dev',
        environmentConfig: {
          oauth_token_url: 'https://issuer.example/token',
          kong_admin_url: 'http://kong-admin',
        },
        service,
        requesterDetails,
      }),
    (error: Error & { details?: { missing?: string[] } }) => {
      assert.match(error.message, /SDX\.R1\.00 security configuration/);
      assert.deepEqual(error.details?.missing, [
        'sdx_token_exchange_client_id',
        'sdx_token_exchange_token_url',
        'sdx_trusted_issuers',
      ]);
      return true;
    }
  );
});

test('requires an explicit exchange endpoint even when control-plane OAuth uses a trusted issuer', () => {
  assert.throws(
    () =>
      buildR1SecurityConfig({
        environment: 'dev',
        environmentConfig: {
          ...environment,
          oauth_token_url:
            'https://issuer.example/realms/standard/protocol/openid-connect/token',
          sdx_token_exchange_token_url: undefined,
        },
        service,
        requesterDetails,
      }),
    /missing: sdx_token_exchange_token_url/
  );
});

test('canonicalizes issuer and endpoint host case, default ports, and trailing slashes', () => {
  const result = buildR1SecurityConfig({
    environment: 'dev',
    environmentConfig: environment,
    service,
    requesterDetails,
  });

  assert.deepEqual(result.consumer.token.allowedIss, [
    'https://issuer.example/realms/standard',
  ]);
  assert.equal(
    result.consumer.tokenExchange.tokenEndpoint,
    'https://issuer.example/realms/standard/protocol/openid-connect/token'
  );
});

test('rejects blank trusted issuer entries', () => {
  assert.throws(
    () =>
      buildR1SecurityConfig({
        environment: 'dev',
        environmentConfig: {
          ...environment,
          sdx_trusted_issuers: ['https://issuer.example/realms/standard', ' '],
        },
        service,
        requesterDetails,
      }),
    /blank value in sdx_trusted_issuers/
  );
});

test('rejects an explicit exchange endpoint outside the trusted issuers', () => {
  assert.throws(
    () =>
      buildR1SecurityConfig({
        environment: 'dev',
        environmentConfig: {
          ...environment,
          sdx_token_exchange_token_url:
            'https://untrusted.example/realms/standard/protocol/openid-connect/token',
        },
        service,
        requesterDetails,
      }),
    /token endpoint is outside sdx_trusted_issuers/
  );
});

test('rejects an invalid exchange endpoint URL', () => {
  assert.throws(
    () =>
      buildR1SecurityConfig({
        environment: 'dev',
        environmentConfig: {
          ...environment,
          sdx_token_exchange_token_url: 'not-a-url',
        },
        service,
        requesterDetails,
      }),
    /invalid URL in sdx_token_exchange_token_url/
  );
});

test('rejects requester service identity that contradicts the catalog', () => {
  assert.throws(
    () =>
      buildR1SecurityConfig({
        environment: 'dev',
        environmentConfig: environment,
        service,
        requesterDetails: {
          ...requesterDetails,
          service: {
            ...requesterDetails.service,
            clientId: 'ADOPTER.OVERRIDE',
          },
        },
      }),
    /does not match authoritative provider/
  );
});

test('R1 defaults do not enable the new strict route settings yet', () => {
  const defaults = SDXPolicy.defaults(
    {
      name: 'CONSUMER',
      clientId: 'MIN.CONSUMER.APP',
      integrationClientIds: [],
    },
    service,
    requesterDetails
  );
  const consumer = (
    defaults.clientResources as {
      gatewayPatterns: Record<string, { upgrades?: Record<string, unknown> }>;
    }
  ).gatewayPatterns['sdx-p2p-consumer.r1'];

  assert.deepEqual(Object.keys(consumer.upgrades || {}).sort(), [
    'counterSign',
    'sign',
    'verify',
  ]);
});

test('R0 preflight remains a no-op', () => {
  assert.doesNotThrow(() =>
    new PolicyService().preflightConnectionRequest('SDX.R0.00', {
      environment: 'dev',
      environmentConfig: undefined,
      service,
      requesterDetails: undefined,
    })
  );
});
