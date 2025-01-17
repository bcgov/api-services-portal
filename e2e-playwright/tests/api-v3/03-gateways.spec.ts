import { test, expect } from '@playwright/test';
import { callAPI, setRequestBody } from '../../helpers/api-helpers';
import { buildOrgGatewayDatasetAndProduct } from '../../helpers/setup-helpers';
import { v4 as uuidv4 } from 'uuid';

test.describe('Gateways', () => {
  let workingData: any;

  test.beforeAll(async ({ request }) => {
    workingData = await buildOrgGatewayDatasetAndProduct(request);
  });

  test.describe('Happy Paths', () => {
    test('POST /gateways', async ({ request }) => {
      const payload = {
        displayName: 'My ABC Gateway',
      };
      
      setRequestBody(payload);
      const postResponse = await callAPI(request, 'gateways', 'POST');
      expect(postResponse.apiRes.status).toBe(200);
      expect(postResponse.apiRes.body.displayName).toBe(payload.displayName);

      const gateway = postResponse.apiRes.body;

      // Verify gateway details
      const getResponse = await callAPI(request, `gateways/${gateway.gatewayId}`, 'GET');
      expect(getResponse.apiRes.status).toBe(200);
      expect(getResponse.apiRes.body.displayName).toBe(gateway.displayName);

      // Verify gateway activity
      const activityResponse = await callAPI(request, `gateways/${gateway.gatewayId}/activity`, 'GET');
      expect(activityResponse.apiRes.status).toBe(200);
      expect(activityResponse.apiRes.body.length).toBe(1);
      expect(activityResponse.apiRes.body[0].message).toBe('{actor} created {ns} namespace');
      expect(activityResponse.apiRes.body[0].params.ns).toBe(gateway.gatewayId);
    });

    test('POST /gateways (with no payload)', async ({ request }) => {
      const payload = {};
      setRequestBody(payload);
      
      const response = await callAPI(request, 'gateways', 'POST');
      const match = {
        gatewayId: response.apiRes.body.gatewayId,
        displayName: "janis's Gateway",
      };
      
      expect(response.apiRes.status).toBe(200);
      expect(JSON.stringify(response.apiRes.body)).toBe(JSON.stringify(match));
    });

    test('POST /gateways (with gatewayId)', async ({ request }) => {
      const customId = uuidv4().replace(/-/g, '').toLowerCase().substring(0, 3);
      const payload = {
        gatewayId: `custom-${customId}-gw`,
        displayName: 'ABC GW',
      };
      
      setRequestBody(payload);
      const response = await callAPI(request, 'gateways', 'POST');
      expect(response.apiRes.status).toBe(200);
      expect(response.apiRes.body.gatewayId).toBe(payload.gatewayId);
      expect(response.apiRes.body.displayName).toBe(payload.displayName);
    });

    test('POST /gateways (with all valid chars)', async ({ request }) => {
      const customId = uuidv4().replace(/-/g, '').toLowerCase().substring(0, 3);
      const payload = {
        gatewayId: `custom-${customId}-gw`,
        displayName: 'ABC GW with ( ) - _ / . chars',
      };
      
      setRequestBody(payload);
      const response = await callAPI(request, 'gateways', 'POST');
      expect(response.apiRes.status).toBe(200);
      expect(response.apiRes.body.gatewayId).toBe(payload.gatewayId);
      expect(response.apiRes.body.displayName).toBe(payload.displayName);
    });

    test('POST /gateways (no displayname)', async ({ request }) => {
      const customId = uuidv4().replace(/-/g, '').toLowerCase().substring(0, 10);
      const payload = {
        gatewayId: `a${customId}a`,
      };
      
      setRequestBody(payload);
      const response = await callAPI(request, 'gateways', 'POST');
      const match = {
        gatewayId: payload.gatewayId,
        displayName: "janis's Gateway",
      };
      
      expect(response.apiRes.status).toBe(200);
      expect(JSON.stringify(response.apiRes.body)).toBe(JSON.stringify(match));
    });

    test('GET /gateways', async ({ request }) => {
      const { gateway } = workingData;
      const response = await callAPI(request, 'gateways', 'GET');
      expect(response.apiRes.status).toBe(200);

      // Look for the specific gateway in the response body
      const foundGateway = response.apiRes.body.find(
        (item: { gatewayId: string, displayName: string }) => 
          item.gatewayId === gateway.gatewayId && item.displayName === gateway.displayName
      );

      // Assert that the gateway was found
      expect(foundGateway).toBeDefined();
    });

    test('GET /gateways/{gatewayId}', async ({ request }) => {
      const { gateway } = workingData;
      const response = await callAPI(request, `gateways/${gateway.gatewayId}`, 'GET');
      expect(response.apiRes.status).toBe(200);
      expect(response.apiRes.body.displayName).toBe(gateway.displayName);
    });

    test('GET /gateways/{gatewayId}/activity', async ({ request }) => {
      const { gateway } = workingData;
      const response = await callAPI(request, `gateways/${gateway.gatewayId}/activity`, 'GET');
      expect(response.apiRes.status).toBe(200);
      expect(response.apiRes.body.length).toBe(3);
      expect(response.apiRes.body[2].message).toBe('{actor} created {ns} namespace');
      expect(response.apiRes.body[2].params.ns).toBe(gateway.gatewayId);
    });
  });

  test.describe('Error Paths', () => {
    test('POST /gateways (bad gatewayId)', async ({ request }) => {
      const payload = {
        gatewayId: 'CAP-LETTERS',
        displayName: 'My ABC Gateway',
      };
      
      setRequestBody(payload);
      const response = await callAPI(request, 'gateways', 'POST');
      const match = {
        message: 'Validation Failed',
        details: {
          d0: {
            message: 'Gateway ID must be between 5 and 15 lowercase alpha-numeric characters and start and end with a letter.',
          },
        },
      };
      
      expect(response.apiRes.status).toBe(422);
      expect(JSON.stringify(response.apiRes.body)).toBe(JSON.stringify(match));
    });

    test('POST /gateways (display name too long)', async ({ request }) => {
      const payload = {
        displayName: 'this display name is more than 30 characters',
      };
      
      setRequestBody(payload);
      const response = await callAPI(request, 'gateways', 'POST');
      const match = {
        message: 'Validation Failed',
        details: {
          d0: {
            message: 'Display name must be between 3 and 30 characters, starting with an alpha-numeric character, and can only use special characters "-()_ .\'/".',
          },
        },
      };
      
      expect(response.apiRes.status).toBe(422);
      expect(JSON.stringify(response.apiRes.body)).toBe(JSON.stringify(match));
    });

    test('POST /gateways (display name invalid characters)', async ({ request }) => {
      const payload = {
        displayName: 'this display name has invalid # char',
      };
      
      setRequestBody(payload);
      const response = await callAPI(request, 'gateways', 'POST');
      const match = {
        message: 'Validation Failed',
        details: {
          d0: {
            message: 'Display name must be between 3 and 30 characters, starting with an alpha-numeric character, and can only use special characters "-()_ .\'/".',
          },
        },
      };
      
      expect(response.apiRes.status).toBe(422);
      expect(JSON.stringify(response.apiRes.body)).toBe(JSON.stringify(match));
    });
  });
}); 