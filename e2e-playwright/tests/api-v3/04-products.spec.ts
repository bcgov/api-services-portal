import { test, expect } from '@playwright/test';
import { callAPI, setRequestBody } from '../../helpers/api-helpers';
import { buildOrgGatewayDatasetAndProduct } from '../../helpers/setup-helpers';

test.describe('Products', () => {
  let workingData: any;

  test.beforeAll(async ({ request }) => {
    workingData = await buildOrgGatewayDatasetAndProduct(request);
  });

  test.describe('Happy Paths', () => {
    test('PUT /gateways/{gatewayId}/products', async ({ request }) => {
      const { gateway } = workingData;
      setRequestBody({
        name: `my-product-on-${gateway.gatewayId}`,
        environments: [
          {
            name: 'dev',
            active: false,
            approval: false,
            flow: 'public',
          },
        ],
      });
      
      const response = await callAPI(request, `gateways/${gateway.gatewayId}/products`, 'PUT');
      expect(response.apiRes.status).toBe(200);
    //   console.log(JSON.stringify(response.apiRes.body));
    });

    test('GET /gateways/{gatewayId}/products', async ({ request }) => {
      const { gateway } = workingData;
      const response = await callAPI(request, `gateways/${gateway.gatewayId}/products`, 'GET');
      expect(response.apiRes.status).toBe(200);
    //   console.log(JSON.stringify(response.apiRes.body, null, 2));
      expect(response.apiRes.body.length).toBe(1);
      expect(response.apiRes.body[0].name).toBe(`my-product-on-${gateway.gatewayId}`);
      expect(response.apiRes.body[0].environments.length).toBe(1);
    });
  });
}); 