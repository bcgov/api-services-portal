import { GetConfigUsingPattern } from '../../../services/gateway-patterns/evaluator';
import { logger } from '../../../logger';

describe('Gateway Simple Pattern', function () {
  it('it should return a GatewayService configuration', async function () {
    const patternConfig = {
      pattern: 'simple-service.r1',
      parameters: {
        gateway_id: 'gw-12345',
        service_name: 'test-service',
        service_url: 'https://httpbun.com',
      },
    };

    const result = await GetConfigUsingPattern(undefined, patternConfig);

    const expected = [
      {
        kind: 'GatewayService',
        name: 'sdx.test-service',
        tags: ['ns.gw-12345.test-service'],
        url: 'https://httpbun.com',
        routes: [
          {
            name: 'sdx.test-service',
            tags: ['ns.gw-12345.test-service'],
            hosts: ['test-service.dev.api.gov.bc.ca'],
          },
        ],
      },
    ];
    expect(result).toStrictEqual(expected);
  });

  it('it should return error missing param', async function () {
    const patternConfig = {
      pattern: 'simple-service.r1',
      parameters: {
        service_name: 'test-service',
        service_url: 'https://httpbun.com',
      },
    };

    await expect(
      GetConfigUsingPattern(undefined, patternConfig)
    ).rejects.toThrow('missing required parameter: gateway_id');
  });
});
