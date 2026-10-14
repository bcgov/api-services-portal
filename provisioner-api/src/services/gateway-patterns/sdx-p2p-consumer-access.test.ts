import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SDXP2PConsumerAccessPattern } from './sdx-p2p-consumer-access.js';

const pattern = new SDXP2PConsumerAccessPattern({} as never, {} as never);

const data = {
  gatewayId: 'consumer-gateway',
  client: {
    clientId: 'consumer-subsystem',
    gateway: { id: 'consumer-gateway' },
  },
  allowedAccess: {
    integrationId: 'integration-a',
    submissionId: 'submission-a',
    clientId: 'oauth-client-a',
    resourceServers: [
      {
        subsystem: 'provider-subsystem',
        services: [{ name: 'service-a', scopes: [] }],
      },
    ],
  },
} as never;

test('sets custom_id to the OAuth client ID for managed R1 consumers', () => {
  const documents = pattern.eval(
    {
      connId: 'connection-a',
      clientId: 'consumer-subsystem',
      serviceId: 'service-a',
    },
    data
  );
  const consumer = documents.find(
    (document) => document.kind === 'GatewayConsumer'
  );

  assert.deepEqual(
    {
      username: consumer.username,
      customId: consumer.custom_id,
      groups: consumer.acls,
    },
    {
      username: 'oauth-client-a',
      customId: 'oauth-client-a',
      groups: [{ group: 'service-a' }, { group: 'consumer-subsystem' }],
    }
  );
  assert.equal(
    documents.filter(
      (document) => document.kind === 'IntegrationAllowedServices'
    ).length,
    1
  );
});

test('does not assign custom_id to explicit non-managed client overrides', () => {
  const documents = pattern.eval(
    {
      connId: 'connection-a',
      clientId: 'consumer-subsystem',
      serviceId: 'service-a',
      integrationClientId: 'override-client',
    },
    data
  );

  assert.equal(documents.length, 1);
  assert.equal(documents[0].username, 'oauth-client-a');
  assert.equal(documents[0].custom_id, undefined);
});
