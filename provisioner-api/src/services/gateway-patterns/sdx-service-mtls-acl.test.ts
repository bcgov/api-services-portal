import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SDXServiceOpsPattern } from './sdx-service-ops.js';
import { SDXServicePattern } from './sdx-service.js';

function evaluateMtlsAcl(
  Pattern: typeof SDXServicePattern | typeof SDXServiceOpsPattern,
  mtlsAcl: Record<string, unknown>
) {
  const pattern = new Pattern({} as never);
  const resources = pattern.eval(
    {
      serviceId: 'TEST.SERVICE.v1',
      upstreamUrl: 'https://upstream.example',
      useSni: 'true',
      environment: 'dev',
      upgrades: { mtlsAcl },
    } as never,
    {
      gatewayId: 'provider-gateway',
      subsystem: { clientId: 'TEST.PROVIDER' },
      service: { name: 'TEST.SERVICE.v1' },
      subsystemRuntimeGroup: { host: 'rg0.dev.servers.sdx' },
    } as never
  );

  return resources[0].plugins.find(
    (plugin: { name: string }) => plugin.name === 'mtls-acl'
  ).config;
}

test('sdx-service translates its legacy certificate header to the native attribute', () => {
  const config = evaluateMtlsAcl(SDXServicePattern, {
    allow: ['CN=trusted-issuer'],
    certificateHeaderName: 'X-Client-Cert-I-DN',
  });

  assert.deepEqual(config, {
    allow: ['CN=trusted-issuer'],
    certificate_attribute: 'issuer_dn',
  });
});

test('sdx-service-ops accepts the current certificate attribute directly', () => {
  const config = evaluateMtlsAcl(SDXServiceOpsPattern, {
    allow: ['trusted-client'],
    certificateAttribute: 'common_name',
  });

  assert.deepEqual(config, {
    allow: ['trusted-client'],
    certificate_attribute: 'common_name',
  });
});

test('legacy custom headers that cannot map to a certificate attribute fail clearly', () => {
  assert.throws(
    () =>
      evaluateMtlsAcl(SDXServicePattern, {
        allow: ['trusted-client'],
        certificateHeaderName: 'X-Custom-Certificate-Header',
      }),
    /Unsupported mtlsAcl certificateHeaderName/
  );
});

test('invalid certificate attributes fail before reaching Kong', () => {
  assert.throws(
    () =>
      evaluateMtlsAcl(SDXServiceOpsPattern, {
        allow: ['trusted-client'],
        certificateAttribute: 'invalid',
      }),
    /Unsupported mtlsAcl certificateAttribute/
  );
});
