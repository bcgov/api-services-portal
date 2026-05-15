const {
  deleteRecordByInternalId,
  getRecords,
} = require('../../../batch/feed-worker');
const {
  SubsystemService,
} = require('../../../services/batch/subsystem');
const {
  OpenAPISpecService,
} = require('../../../services/batch/oas-service');
const {
  getNamespaceDetails,
} = require('../../../services/workflow/get-namespaces');

jest.mock('../../../batch/feed-worker', () => ({
  deleteRecordByInternalId: jest.fn(),
  getRecords: jest.fn(),
  removeEmpty: jest.fn((record) => record),
  removeKeys: jest.fn((record) => record),
  replaceKey: jest.fn((record) => record),
  syncRecordsThrowErrors: jest.fn(),
  transformAllRefID: jest.fn((record) => record),
}));

jest.mock('../../../services/gateway-patterns/catalog', () => ({
  GetSubsystemEntryForSubsystem: jest.fn(() => ({
    clientId: 'LAB.MIN.CITZ.MY-SUBSYSTEM',
  })),
  ParseClientId: jest.fn(() => ({
    member: {
      memberClass: 'MIN',
      memberId: 'CITZ',
    },
    subsystem: {
      name: 'MY-SUBSYSTEM',
    },
  })),
}));

jest.mock('../../../services/batch/oas-service', () => ({
  OpenAPISpecService: jest.fn().mockImplementation(() => ({
    listOpenAPISpecsBySubsystemId: jest.fn(),
    listActiveConnectionsByServiceId: jest.fn(),
  })),
}));

jest.mock('../../../services/workflow/get-namespaces', () => ({
  getNamespaceDetails: jest.fn(),
}));

describe('SubsystemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getNamespaceDetails.mockResolvedValue(null);
  });

  describe('deleteSubsystem', () => {
    const context = {};
    const subsystem = {
      id: 'subsystem-123',
      name: 'MY-SUBSYSTEM',
      namespace: undefined,
      organization: {
        name: 'ministry-of-citz',
        tags: 'member_id:CITZ',
      },
    };
    const serviceSpec = {
      id: 'service-123',
      name: 'LAB.MIN.CITZ.SERVICE-A.v1',
    };

    const setupDeleteSubsystem = ({
      activeClientConnections = [],
      serviceSpecs = [],
      activeProviderConnections = [],
      subsystemRecord = subsystem,
    } = {}) => {
      getRecords
        .mockResolvedValueOnce([subsystemRecord])
        .mockResolvedValueOnce(activeClientConnections);

      OpenAPISpecService.mockImplementation(() => ({
        listOpenAPISpecsBySubsystemId: jest.fn().mockResolvedValue(serviceSpecs),
        listActiveConnectionsByServiceId: jest
          .fn()
          .mockResolvedValue(activeProviderConnections),
      }));
    };

    it('deletes related OAS services and the subsystem when there are no active connection requests or gateway config', async () => {
      const service = new SubsystemService();

      setupDeleteSubsystem({
        serviceSpecs: [serviceSpec],
      });

      deleteRecordByInternalId
        .mockResolvedValueOnce({
          status: 200,
          result: 'deleted',
          id: 'service-123',
          childResults: [],
        })
        .mockResolvedValueOnce({
          status: 200,
          result: 'deleted',
          id: 'subsystem-123',
          childResults: [],
        });

      const result = await service.deleteSubsystem(
        context,
        'ministry-of-citz',
        'MY-SUBSYSTEM'
      );

      expect(deleteRecordByInternalId).toHaveBeenCalledWith(
        context,
        'OpenAPISpec',
        'service-123'
      );
      expect(deleteRecordByInternalId).toHaveBeenCalledWith(
        context,
        'Subsystem',
        'subsystem-123'
      );
      expect(result).toEqual({
        status: 200,
        result: 'deleted',
        id: 'subsystem-123',
        childResults: [
          {
            status: 200,
            result: 'deleted',
            id: 'service-123',
            childResults: [],
          },
        ],
      });
    });

    it('rejects delete when active client connection requests exist', async () => {
      const service = new SubsystemService();

      setupDeleteSubsystem({
        activeClientConnections: [
          {
            id: 'connection-123',
            clientId: 'LAB.MIN.CITZ.MY-SUBSYSTEM',
            isActive: true,
          },
        ],
      });

      await expect(
        service.deleteSubsystem(context, 'ministry-of-citz', 'MY-SUBSYSTEM')
      ).rejects.toThrow(
        'Subsystem cannot be deleted because it has active connection requests as a client'
      );
      expect(deleteRecordByInternalId).not.toHaveBeenCalled();
    });

    it('rejects delete when subsystem gateway configuration exists', async () => {
      const service = new SubsystemService();

      setupDeleteSubsystem({
        subsystemRecord: {
          ...subsystem,
          namespace: 'sdx-subsystem-gateway',
        },
      });

      getNamespaceDetails.mockResolvedValue({
        name: 'sdx-subsystem-gateway',
      });

      await expect(
        service.deleteSubsystem(context, 'ministry-of-citz', 'MY-SUBSYSTEM')
      ).rejects.toThrow(
        'Subsystem cannot be deleted because gateway configuration exists'
      );
      expect(deleteRecordByInternalId).not.toHaveBeenCalled();
    });

    it('rejects delete when active provider connection requests exist', async () => {
      const service = new SubsystemService();

      setupDeleteSubsystem({
        serviceSpecs: [serviceSpec],
        activeProviderConnections: [
          {
            id: 'connection-123',
            serviceId: 'LAB.MIN.CITZ.SERVICE-A.v1',
            isActive: true,
          },
        ],
      });

      await expect(
        service.deleteSubsystem(context, 'ministry-of-citz', 'MY-SUBSYSTEM')
      ).rejects.toThrow(
        'Subsystem cannot be deleted because it has active connection requests as a service provider'
      );
      expect(deleteRecordByInternalId).not.toHaveBeenCalled();
    });
  });
});