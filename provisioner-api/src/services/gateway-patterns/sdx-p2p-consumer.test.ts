import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SDXP2PConsumerPattern } from './sdx-p2p-consumer.js';

function evaluateConsumerPattern() {
  const pattern = new SDXP2PConsumerPattern({} as never);
  return pattern.eval(
    {
      connId: '11',
      clientId: 'TEST.CLIENT',
      serviceId: 'TEST.SERVICE.v1',
      stripPath: false,
      upgrades: {},
    } as never,
    {
      client: {
        clientId: 'TEST.CLIENT',
        gateway: { id: 'client-gateway' },
      },
      service: { name: 'TEST.SERVICE.v1' },
      serviceSubsystem: {},
      clientRuntimeGroup: {
        consumerEndpoint: 'https://pzgw.dev.example.test',
      },
      serviceRuntimeGroup: {
        host: 'share0.dev.example.test',
        sdxEndpoint: 'https://share0.dev.example.test',
      },
    } as never
  );
}

test('replaces caller-supplied identity headers with provisioned values', () => {
  const resources = evaluateConsumerPattern();
  const transformer = resources[0].plugins.find(
    (plugin: { name: string }) => plugin.name === 'request-transformer'
  );

  assert.deepEqual(transformer.config.remove.headers, [
    'X-Client-Id',
    'X-SDX-Client-Subsystem-Id',
    'X-Service-Id',
  ]);
  assert.ok(
    transformer.config.add.headers.includes(
      'X-SDX-Client-Subsystem-Id:TEST.CLIENT'
    )
  );
  assert.ok(transformer.config.add.headers.includes('X-Client-Id:TEST.CLIENT'));
  assert.ok(
    transformer.config.add.headers.includes('X-Service-Id:TEST.SERVICE.v1')
  );
});

test('keeps the legacy client header as the consumer route selector', () => {
  const resources = evaluateConsumerPattern();

  assert.deepEqual(resources[0].routes[0].headers, {
    'X-Client-Id': ['TEST.CLIENT'],
  });
});
