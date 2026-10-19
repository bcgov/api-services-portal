const {
  deleteRecordByInternalId,
  getRecords,
  syncRecordsThrowErrors,
} = require('../../../batch/feed-worker');
const { SubsystemService } = require('../../../services/batch/subsystem');
const { OpenAPISpecService } = require('../../../services/batch/oas-service');
const {
  getNamespaceDetails,
} = require('../../../services/workflow/get-namespaces');
const { BatchService } = require('../../../services/keystone/batch-service');

const mockUpdate = jest.fn();

jest.mock('../../../services/keystone/batch-service', () => ({
  BatchService: jest.fn().mockImplementation(() => ({
    update: mockUpdate,
  })),
}));

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

const mockGetGatewayResources = jest.fn();

jest.mock('../../../services/provisioner', () => ({
  ProvisionerService: jest.fn().mockImplementation(() => ({
    getGatewayResources: mockGetGatewayResources,
  })),
}));

describe('SubsystemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getNamespaceDetails.mockResolvedValue(null);
    mockGetGatewayResources.mockResolvedValue([]);
    mockUpdate.mockResolvedValue({ id: 'association-a' });
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
        listOpenAPISpecsBySubsystemId: jest
          .fn()
          .mockResolvedValue(serviceSpecs),
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

    it('continues subsystem delete when cascade OAS delete fails', async () => {
      const service = new SubsystemService();

      setupDeleteSubsystem({
        serviceSpecs: [serviceSpec],
      });

      deleteRecordByInternalId
        .mockResolvedValueOnce({
          status: 400,
          result: 'deletion-failed',
          id: 'service-123',
        })
        .mockResolvedValueOnce({
          status: 200,
          result: 'deleted',
          id: 'subsystem-123',
        });

      await service.deleteSubsystem(
        context,
        'ministry-of-citz',
        'MY-SUBSYSTEM'
      );

      expect(deleteRecordByInternalId).toHaveBeenCalledWith(
        context,
        'Subsystem',
        'subsystem-123'
      );
    });

    it('deletes the integration mapping before deleting the subsystem', async () => {
      const service = new SubsystemService();

      setupDeleteSubsystem({
        subsystemRecord: {
          ...subsystem,
          integrations: [{ id: 'integration-123' }],
        },
      });

      deleteRecordByInternalId
        .mockResolvedValueOnce({
          status: 200,
          result: 'deleted',
          id: 'integration-123',
        })
        .mockResolvedValueOnce({
          status: 200,
          result: 'deleted',
          id: 'subsystem-123',
        });

      const result = await service.deleteSubsystem(
        context,
        'ministry-of-citz',
        'MY-SUBSYSTEM'
      );

      expect(deleteRecordByInternalId).toHaveBeenNthCalledWith(
        1,
        context,
        'SubsystemIntegration',
        'integration-123'
      );
      expect(deleteRecordByInternalId).toHaveBeenNthCalledWith(
        2,
        context,
        'Subsystem',
        'subsystem-123'
      );
      expect(result.childResults).toEqual([
        {
          status: 200,
          result: 'deleted',
          id: 'integration-123',
        },
      ]);
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
      mockGetGatewayResources.mockResolvedValue([{ id: 'resource-1' }]);

      await expect(
        service.deleteSubsystem(context, 'ministry-of-citz', 'MY-SUBSYSTEM')
      ).rejects.toThrow(
        'Subsystem cannot be deleted because gateway configuration exists'
      );
      expect(mockGetGatewayResources).toHaveBeenCalledWith(
        'sdx-subsystem-gateway'
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

  describe('lookupSubsystemIntegration', () => {
    const context = {};

    it('returns the matching integration record when one exists', async () => {
      const service = new SubsystemService();
      const integration = {
        id: 'integration-123',
        integrationClientId: 'CLIENT-A',
      };

      getRecords.mockResolvedValueOnce([integration]);

      const result = await service.lookupSubsystemIntegration(
        context,
        'CLIENT-A'
      );

      expect(result).toEqual(integration);
    });

    it('returns undefined instead of throwing when no integration matches', async () => {
      const service = new SubsystemService();

      getRecords.mockResolvedValueOnce([]);

      const result = await service.lookupSubsystemIntegration(
        context,
        'UNKNOWN-CLIENT'
      );

      expect(result).toBeUndefined();
    });
  });

  describe('zero-or-one subsystem integrations', () => {
    it('creates a subsystem without an integration mapping', async () => {
      const service = new SubsystemService();
      const body = {
        name: 'MY-SUBSYSTEM',
        organization: 'ministry-of-citz',
      };
      syncRecordsThrowErrors.mockResolvedValueOnce({
        status: 200,
        result: 'created',
        id: 'subsystem-a',
      });

      await expect(service.upsertSubsystem({}, body)).resolves.toEqual({
        status: 200,
        result: 'created',
        id: 'subsystem-a',
      });
      expect(getRecords).not.toHaveBeenCalled();
      expect(syncRecordsThrowErrors).toHaveBeenCalledTimes(1);
      expect(syncRecordsThrowErrors).toHaveBeenCalledWith(
        {},
        'Subsystem',
        undefined,
        body
      );
    });

    it('rejects a subsystem payload containing multiple integrations', async () => {
      const service = new SubsystemService();

      await expect(
        service.upsertSubsystem(
          {},
          {
            name: 'MY-SUBSYSTEM',
            integrations: [
              { integrationClientId: 'CLIENT-A' },
              { integrationClientId: 'CLIENT-B' },
            ],
          }
        )
      ).rejects.toThrow('can be associated with only one CSS integration');
      expect(syncRecordsThrowErrors).not.toHaveBeenCalled();
    });

    it('creates the subsystem before linking its first integration', async () => {
      const service = new SubsystemService();
      const body = {
        name: 'MY-SUBSYSTEM',
        organization: 'ministry-of-citz',
        integrations: [{ integrationClientId: 'CLIENT-A' }],
      };
      getRecords.mockResolvedValueOnce([]);
      syncRecordsThrowErrors
        .mockResolvedValueOnce({
          status: 200,
          result: 'created',
          id: 'subsystem-a',
        })
        .mockResolvedValueOnce({
          status: 200,
          result: 'updated-child',
          id: 'subsystem-a',
          childResults: [
            { status: 200, result: 'created', id: 'association-a' },
          ],
        });

      const result = await service.upsertSubsystem({}, body);

      expect(syncRecordsThrowErrors).toHaveBeenNthCalledWith(
        1,
        {},
        'Subsystem',
        undefined,
        {
          name: 'MY-SUBSYSTEM',
          organization: 'ministry-of-citz',
        }
      );
      expect(syncRecordsThrowErrors).toHaveBeenNthCalledWith(
        2,
        {},
        'Subsystem',
        undefined,
        body
      );
      expect(result).toEqual({
        status: 200,
        result: 'created',
        id: 'subsystem-a',
        childResults: [{ status: 200, result: 'created', id: 'association-a' }],
      });
    });

    it('replaces an existing integration in place', async () => {
      const service = new SubsystemService();
      const body = {
        name: 'MY-SUBSYSTEM',
        organization: 'ministry-of-citz',
        integrations: [{ integrationClientId: 'CLIENT-B' }],
      };
      getRecords.mockResolvedValueOnce([
        {
          id: 'subsystem-a',
          integrations: [
            { id: 'association-a', integrationClientId: 'CLIENT-A' },
          ],
        },
      ]);
      syncRecordsThrowErrors.mockResolvedValueOnce({
        status: 200,
        result: 'no-change',
        id: 'subsystem-a',
      });

      await service.upsertSubsystem({}, body);

      expect(BatchService).toHaveBeenCalledWith({});
      expect(mockUpdate).toHaveBeenCalledWith(
        'SubsystemIntegration',
        'association-a',
        { integrationClientId: 'CLIENT-B' }
      );
      expect(syncRecordsThrowErrors).toHaveBeenCalledWith(
        {},
        'Subsystem',
        undefined,
        body
      );
    });
  });
});
