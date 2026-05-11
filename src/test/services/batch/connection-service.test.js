const {
  deleteRecordByInternalId,
} = require('../../../batch/feed-worker');
const {
  ConnectionService,
} = require('../../../services/batch/connection-service');
const {
  SubsystemService,
} = require('../../../services/batch/subsystem');
const {
  OpenAPISpecService,
} = require('../../../services/batch/oas-service');

jest.mock('../../../batch/feed-worker', () => ({
  deleteRecordByInternalId: jest.fn(),
  getRecords: jest.fn(),
  removeKeys: jest.fn((record) => record),
  syncRecordsThrowErrors: jest.fn(),
}));

jest.mock('../../../services/batch/subsystem', () => ({
  SubsystemService: jest.fn().mockImplementation(() => ({
    findSubsystemByClientId: jest.fn(),
  })),
}));

jest.mock('../../../services/batch/oas-service', () => ({
  OpenAPISpecService: jest.fn().mockImplementation(() => ({
    findOpenAPISpecByName: jest.fn(),
  })),
}));

describe('ConnectionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  describe('deleteConnection', () => {
    const context = {};
    const connection = {
      id: '123',
      clientId: 'LAB.MIN.CITZ.MY-SUBSYSTEM',
      serviceId: 'LAB.MIN.CITZ.SERVICE-A.v1',
    };
    const clientSubsystem = {
      namespace: 'sdx-client-gateway',
      organization: {
        name: 'ministry-of-citz',
      },
    };
    const serviceSpec = {
      subsystem: {
        namespace: 'sdx-service-gateway',
      },
      organization: {
        name: 'ministry-of-citz',
      },
    };

    const setupDeleteConnection = (service, status) => {
      service.getConnectionById = jest.fn().mockResolvedValue(connection);
      service.getConnectionDeleteStatus = jest.fn().mockResolvedValue(status);

      SubsystemService.mockImplementation(() => ({
        findSubsystemByClientId: jest.fn().mockResolvedValue(clientSubsystem),
      }));

      OpenAPISpecService.mockImplementation(() => ({
        findOpenAPISpecByName: jest.fn().mockResolvedValue(serviceSpec),
      }));
    };

    it('deletes the connection request when client and service gateway config are removed', async () => {
      const service = new ConnectionService();

      setupDeleteConnection(service, {
        clientTag: 'ns.sdx-client-gateway.123.c',
        serviceTag: 'ns.sdx-service-gateway.123.p',
        clientConfigCount: 0,
        serviceConfigCount: 0,
      });

      deleteRecordByInternalId.mockResolvedValue({
        status: 200,
        result: 'deleted',
        id: '123',
        childResults: [],
      });

      const result = await service.deleteConnection(
        context,
        'ministry-of-citz',
        '123'
      );

      expect(service.getConnectionById).toHaveBeenCalledWith(context, '123');
      expect(service.getConnectionDeleteStatus).toHaveBeenCalledWith(
        connection,
        clientSubsystem,
        serviceSpec
      );
      expect(deleteRecordByInternalId).toHaveBeenCalledWith(
        context,
        'ConnectionRequest',
        '123'
      );
      expect(result).toEqual({
        status: 200,
        result: 'deleted',
        id: '123',
        childResults: [],
      });
    });

    it('rejects delete when client gateway config still exists', async () => {
      const service = new ConnectionService();

      setupDeleteConnection(service, {
        clientTag: 'ns.sdx-client-gateway.123.c',
        serviceTag: 'ns.sdx-service-gateway.123.p',
        clientConfigCount: 1,
        serviceConfigCount: 0,
      });

      await expect(
        service.deleteConnection(context, 'ministry-of-citz', '123')
      ).rejects.toThrow(
        'Connection request cannot be deleted because client gateway configuration still exists for tag ns.sdx-client-gateway.123.c'
      );
      expect(deleteRecordByInternalId).not.toHaveBeenCalled();
    });

    it('rejects delete when service gateway config still exists', async () => {
      const service = new ConnectionService();

      setupDeleteConnection(service, {
        clientTag: 'ns.sdx-client-gateway.123.c',
        serviceTag: 'ns.sdx-service-gateway.123.p',
        clientConfigCount: 0,
        serviceConfigCount: 1,
      });

      await expect(
        service.deleteConnection(context, 'ministry-of-citz', '123')
      ).rejects.toThrow(
        'Connection request cannot be deleted because service gateway configuration still exists for tag ns.sdx-service-gateway.123.p'
      );
      expect(deleteRecordByInternalId).not.toHaveBeenCalled();
    });

    it('rejects delete with both tags when client and service gateway config still exist', async () => {
      const service = new ConnectionService();

      setupDeleteConnection(service, {
        clientTag: 'ns.sdx-client-gateway.123.c',
        serviceTag: 'ns.sdx-service-gateway.123.p',
        clientConfigCount: 1,
        serviceConfigCount: 1,
      });

      await expect(
        service.deleteConnection(context, 'ministry-of-citz', '123')
      ).rejects.toThrow(
        'Connection request cannot be deleted because client gateway configuration still exists for tag ns.sdx-client-gateway.123.c and service gateway configuration still exists for tag ns.sdx-service-gateway.123.p'
      );
      expect(deleteRecordByInternalId).not.toHaveBeenCalled();
    });
  });
});