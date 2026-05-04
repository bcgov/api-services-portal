const {
  ConnectionService,
} = require('../../../services/batch/connection-service');

describe('ConnectionService', () => {
  describe('buildConnectionConfigTags', () => {
    it('builds client and service Kong config tags for a connection request', () => {
      const service = new ConnectionService();

      const result = service.buildConnectionConfigTags(
        {
          id: '123',
        },
        {
          namespace: 'sdx-client-gateway',
        },
        {
          subsystem: {
            namespace: 'sdx-service-gateway',
          },
        }
      );

      expect(result).toEqual({
        clientTag: 'ns.sdx-client-gateway.123.c',
        serviceTag: 'ns.sdx-service-gateway.123.p',
      });
    });

    it('throws when the client subsystem gateway is missing', () => {
      const service = new ConnectionService();

      expect(() =>
        service.buildConnectionConfigTags(
          {
            id: '123',
          },
          {},
          {
            subsystem: {
              namespace: 'sdx-service-gateway',
            },
          }
        )
      ).toThrow('Client subsystem gateway not found');
    });

    it('throws when the service subsystem gateway is missing', () => {
      const service = new ConnectionService();

      expect(() =>
        service.buildConnectionConfigTags(
          {
            id: '123',
          },
          {
            namespace: 'sdx-client-gateway',
          },
          {
            subsystem: {},
          }
        )
      ).toThrow('Service subsystem gateway not found');
    });
  });
});