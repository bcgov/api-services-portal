import { getRecords } from '../../../batch/feed-worker';
import {
  GetCatalog,
  GetScopes,
} from '../../../services/gateway-patterns/catalog';

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

  describe('GetScopes', () => {
    const read = { name: 'ajc:vehicles:read', description: 'Read vehicles' };
    const write = { name: 'ajc:vehicles:write', description: 'Write vehicles' };

    const spec = (name, operations) => ({
      name,
      title: name,
      version: '1.0.0',
      specVersion: 'openapi=3.0.3',
      environment: 'apsdev',
      description: name,
      operations: JSON.stringify(operations),
      namespace: 'sdx-gw-tec',
      organization: { name: 'ministry-of-tec' },
      subsystem: {
        name: 'VEHICLES',
        description: 'Vehicle records',
        integrations: [],
        organization: { tags: '["member_class:MIN","member_id:TEC"]' },
      },
    });

    const summarize = (scopes) =>
      scopes.map((scope) => ({
        name: scope.name,
        services: scope.services.map((s) => ({
          name: s.name,
          operationIds: s.operationIds,
        })),
      }));

    it('lists each service once per scope with all operations that use it', async () => {
      getRecords.mockResolvedValue([
        spec('APSDEV.MIN.TEC.VEHICLES.v1', [
          { operationId: 'listVehicles', scopes: [read] },
          { operationId: 'getVehicle', scopes: [read] },
          { operationId: 'createVehicle', scopes: [write] },
          { operationId: 'updateVehicle', scopes: [read, write] },
          { operationId: 'deleteVehicle', scopes: [] },
          { operationId: 'health' },
        ]),
        spec('APSDEV.MIN.TEC.FLEET.v1', [
          { operationId: 'listFleet', scopes: [read] },
        ]),
      ]);

      const scopes = await GetScopes({});

      expect(summarize(scopes)).toEqual([
        {
          name: 'ajc:vehicles:read',
          services: [
            {
              name: 'APSDEV.MIN.TEC.VEHICLES.v1',
              operationIds: ['listVehicles', 'getVehicle', 'updateVehicle'],
            },
            { name: 'APSDEV.MIN.TEC.FLEET.v1', operationIds: ['listFleet'] },
          ],
        },
        {
          name: 'ajc:vehicles:write',
          services: [
            {
              name: 'APSDEV.MIN.TEC.VEHICLES.v1',
              operationIds: ['createVehicle', 'updateVehicle'],
            },
          ],
        },
      ]);
      expect(scopes[0]).toMatchObject({
        description: 'Read vehicles',
        namespace: 'ajc',
        resourceType: 'vehicles',
        subResourceTypes: undefined,
        action: 'read',
      });
      expect(scopes[0].services[0]).toMatchObject({
        environment: 'apsdev',
        specVersion: 'openapi=3.0.3',
        version: '1.0.0',
        subsystem: expect.objectContaining({ name: 'VEHICLES' }),
      });
    });

    it('skips scope names it cannot parse and lists the rest', async () => {
      getRecords.mockResolvedValue([
        spec('APSDEV.MIN.TEC.VEHICLES.v1', [
          {
            operationId: 'listVehicles',
            scopes: [{ name: 'ajc:read' }, read, { name: 'read' }],
          },
          {
            operationId: 'updateVehicle',
            scopes: [{ name: 'ajc:read' }, write],
          },
        ]),
        spec('APSDEV.MIN.TEC.TRAILERS.v1', [
          {
            operationId: 'listTrailers',
            scopes: [{ name: 'demo.read' }, read],
          },
        ]),
      ]);

      const scopes = await GetScopes({});

      expect(scopes.map((scope) => scope.name)).toEqual([
        'ajc:vehicles:read',
        'ajc:vehicles:write',
      ]);
      expect(
        scopes[0].services.map((service) => [
          service.name,
          service.operationIds,
        ])
      ).toEqual([
        ['APSDEV.MIN.TEC.VEHICLES.v1', ['listVehicles']],
        ['APSDEV.MIN.TEC.TRAILERS.v1', ['listTrailers']],
      ]);
    });

    it('returns no scopes when every name is unparseable', async () => {
      getRecords.mockResolvedValue([
        spec('APSDEV.MIN.TEC.VEHICLES.v1', [
          { operationId: 'listVehicles', scopes: [{ name: 'ajc:read' }, {}] },
        ]),
      ]);

      await expect(GetScopes({})).resolves.toEqual([]);
    });
  });
});
