const {
  deleteRecordByInternalId,
  getRecords,
} = require('../../../batch/feed-worker');
const {
  OpenAPISpecService,
} = require('../../../services/batch/oas-service');

jest.mock('../../../batch/feed-worker', () => ({
  deleteRecordByInternalId: jest.fn(),
  getRecords: jest.fn(),
}));

describe('OAS Service', function () {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should convert title to name correctly', async function () {
    const service = new OpenAPISpecService();
    const tests = {
      'My Sample Service': 'MY-SAMPLE',
      'Another_Service 123': 'ANOTHERSERVICE-123',
      'Service@2024!': 'SERVICE2024',
      '  Leading and Trailing Spaces  ': 'LEADING-AND-TRAILING-SPACES',
      'Multiple   Spaces': 'MULTIPLE-SPACES',
      'Example-Service-API': 'EXAMPLE',
      'Test Service SVC': 'TEST',
      'Complex Title: Service v2.0!': 'COMPLEX-TITLE-SERVICE-V20',
    };
    for (const [title, expectedName] of Object.entries(tests)) {
      const serviceName = service.titleToServiceName(title);
      expect(serviceName).toBe(expectedName);
    }
  });

  describe('deleteOASService', () => {
    const context = {};
    const serviceSpec = {
      id: 'service-123',
      name: 'LAB.MIN.CITZ.SERVICE-A.v1',
      subsystem: {
        organization: {
          name: 'ministry-of-citz',
        },
      },
    };

    it('deletes the OAS service when there are no active connection requests', async () => {
      const service = new OpenAPISpecService();

      getRecords.mockResolvedValueOnce([serviceSpec]).mockResolvedValueOnce([]);

      deleteRecordByInternalId.mockResolvedValue({
        status: 200,
        result: 'deleted',
        id: 'service-123',
        childResults: [],
      });

      const result = await service.deleteOASService(
        context,
        'ministry-of-citz',
        'LAB.MIN.CITZ.SERVICE-A.v1'
      );

      expect(deleteRecordByInternalId).toHaveBeenCalledWith(
        context,
        'OpenAPISpec',
        'service-123'
      );
      expect(result).toEqual({
        status: 200,
        result: 'deleted',
        id: 'service-123',
        childResults: [],
      });
    });

    it('rejects delete when active connection requests exist', async () => {
      const service = new OpenAPISpecService();

      getRecords
        .mockResolvedValueOnce([serviceSpec])
        .mockResolvedValueOnce([
          {
            id: 'connection-123',
            serviceId: 'LAB.MIN.CITZ.SERVICE-A.v1',
            isActive: true,
          },
        ]);

      await expect(
        service.deleteOASService(
          context,
          'ministry-of-citz',
          'LAB.MIN.CITZ.SERVICE-A.v1'
        )
      ).rejects.toThrow(
        'OAS service cannot be deleted because it has active connection requests'
      );
      expect(deleteRecordByInternalId).not.toHaveBeenCalled();
    });

    it('rejects delete when the service belongs to another organization', async () => {
      const service = new OpenAPISpecService();

      getRecords.mockResolvedValueOnce([serviceSpec]);

      await expect(
        service.deleteOASService(
          context,
          'other-org',
          'LAB.MIN.CITZ.SERVICE-A.v1'
        )
      ).rejects.toMatchObject({
        fields: {
          organization: {
            message: 'Not authorized to access this service',
          },
        },
      });
      expect(deleteRecordByInternalId).not.toHaveBeenCalled();
    });
  });
});
