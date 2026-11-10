import { getRecords } from '../../../batch/feed-worker';
import { GetCatalog } from '../../../services/gateway-patterns/catalog';

jest.mock('../../../batch/feed-worker', () => ({
  getRecords: jest.fn(),
}));

describe('SDX service catalog', () => {
  it('includes the provider subsystem privacy zone', async () => {
    getRecords.mockResolvedValue([
      {
        name: 'APSDEV.MIN.WIDG.WIDGETS.v1',
        title: 'Widgets',
        version: '1.0.0',
        specVersion: 'openapi=3.0.0',
        environment: 'apsdev',
        description: 'Widget service',
        operations: '[]',
        namespace: 'sdx-gw-widgets',
        organization: { name: 'ministry-of-widgets' },
        subsystem: {
          name: 'WIDGETS',
          description: 'Widget resource server',
          privacyZone: 'urn:ca:bc:gov:nrs:ctz:pz:sit',
          integrations: [],
          organization: {
            tags: '["member_class:MIN","member_id:WIDG"]',
          },
        },
      },
    ]);

    const catalog = await GetCatalog({});

    expect(catalog).toHaveLength(1);
    expect(catalog[0].subsystem.privacyZone).toBe(
      'urn:ca:bc:gov:nrs:ctz:pz:sit'
    );
  });
});
