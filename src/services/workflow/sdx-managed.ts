import { strict as assert } from 'assert';

import { GatewayConsumer } from '../keystone/types';

/**
 * SDX consumers are tagged 'sdx' and are managed by the SDX provisioner
 * (through gwa-api), on the SDX Kongs. The Portal reads them from its own
 * records and never changes them on Kong or the IdP.
 */
export function isSdxConsumer(consumer: GatewayConsumer): boolean {
  const tags: string[] = consumer?.tags ? JSON.parse(consumer.tags) : [];
  return tags.includes('sdx');
}

export function assertNotSdxConsumer(consumer: GatewayConsumer): void {
  assert.strictEqual(
    isSdxConsumer(consumer),
    false,
    'SDX consumers are managed through their SDX connections'
  );
}
