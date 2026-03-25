import { OpenAPISpecService } from '../../../services/batch/oas-service';

describe('OAS Service', function () {
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
});
