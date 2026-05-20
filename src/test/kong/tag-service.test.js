const { rest } = require('msw');
const { setupServer } = require('msw/node');
const { KongTagService } = require('../../services/kong/tag-service');

describe('KongTagService', () => {
  const server = setupServer(
    rest.get('https://kong-admin:8001/tags/:tag', (req, res, ctx) => {
      return res(
        ctx.json({
          data: [
            {
              entity_name: 'services',
              entity_id: 'SERVICE-1',
              tag: req.params.tag,
            },
          ],
        })
      );
    })
  );

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('listTaggedConfig', () => {
    it('returns tagged Kong config', async () => {
      const service = new KongTagService('https://kong-admin:8001');

      const result = await service.listTaggedConfig('ns.gateway.1.c');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        entity_name: 'services',
        entity_id: 'SERVICE-1',
        tag: 'ns.gateway.1.c',
      });
    });

    it('returns an empty array when no tagged Kong config exists', async () => {
      server.use(
        rest.get('https://kong-admin:8001/tags/:tag', (req, res, ctx) => {
          return res(ctx.json({ data: [] }));
        })
      );

      const service = new KongTagService('https://kong-admin:8001');

      const result = await service.listTaggedConfig('ns.gateway.1.c');

      expect(result).toEqual([]);
    });

    it('returns an empty array when Kong response has no data property', async () => {
      server.use(
        rest.get('https://kong-admin:8001/tags/:tag', (req, res, ctx) => {
          return res(ctx.json({}));
        })
      );

      const service = new KongTagService('https://kong-admin:8001');

      const result = await service.listTaggedConfig('ns.gateway.1.c');

      expect(result).toEqual([]);
    });

    it('encodes the tag in the Kong Admin API URL', async () => {
      server.use(
        rest.get('https://kong-admin:8001/tags/:tag', (req, res, ctx) => {
          expect(req.url.pathname).toBe('/tags/service%3ALAB.MIN.P001.TOYS.v1');

          return res(
            ctx.json({
              data: [
                {
                  entity_name: 'services',
                  entity_id: 'SERVICE-1',
                  tag: req.params.tag,
                },
              ],
            })
          );
        })
      );

      const service = new KongTagService('https://kong-admin:8001');

      const result = await service.listTaggedConfig('service:LAB.MIN.P001.TOYS.v1');

      expect(result).toHaveLength(1);
    });

    it('throws when Kong Admin API returns an error response', async () => {
      server.use(
        rest.get('https://kong-admin:8001/tags/:tag', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ message: 'Kong error' }));
        })
      );

      const service = new KongTagService('https://kong-admin:8001');

      await expect(service.listTaggedConfig('ns.gateway.1.c')).rejects.toThrow();
    });
  });
});