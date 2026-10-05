import { GatewayConsumer } from '../keystone/types';

/**
 * SDX consumers are provisioned on the SDX Kong (SDX_KONG_URL), not the APS
 * Kong (KONG_URL). Both are synced into the Portal, so pick by the consumer's
 * 'sdx' tag.
 */
export function kongUrlForConsumer(consumer: GatewayConsumer): string {
  const tags: string[] = consumer.tags ? JSON.parse(consumer.tags) : [];
  return tags.includes('sdx') && process.env.SDX_KONG_URL
    ? process.env.SDX_KONG_URL
    : process.env.KONG_URL;
}
