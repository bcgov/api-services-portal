import { test, expect } from '@playwright/test';
import { callAPI, setRequestBody } from '../../helpers/api-helpers';
import { buildOrgGatewayDatasetAndProduct } from '../../helpers/setup-helpers';

test.describe.configure({ mode: 'serial' });

test.describe('Authorization Profiles', () => {
  let workingData: any;

  test.beforeAll(async ({ request }) => {
    console.log('Running beforeAll setup...');
    workingData = await buildOrgGatewayDatasetAndProduct(request);
    console.log(`Setup complete with gateway ID: ${workingData.gateway.gatewayId}`);
  });

  test.describe('Happy Paths', () => {
    test('PUT and GET /gateways/{gatewayId}/issuers', async ({ request }) => {
      const { gateway } = workingData;

      setRequestBody({
        name: `my-auth-profile-for-${gateway.gatewayId}`,
        description: 'Auth connection to my IdP',
        flow: 'client-credentials',
        clientAuthenticator: 'client-secret',
        mode: 'auto',
        inheritFrom: 'Sample Shared IdP',
      });
      
      const response = await callAPI(request, `gateways/${gateway.gatewayId}/issuers`, 'PUT');
      expect(response.apiRes.status).toBe(200);

    });

    test('GET /gateways/{gatewayId}/issuers', async ({ request }) => {
      const { gateway } = workingData;

      const response = await callAPI(request, `gateways/${gateway.gatewayId}/issuers`, 'GET');
      expect(response.apiRes.status).toBe(200);
      expect(response.apiRes.body.length).toBe(1);

      const issuer = response.apiRes.body[0];
      expect(issuer.name).toBe(`my-auth-profile-for-${gateway.gatewayId}`);
      expect(issuer.environmentDetails[1].environment).toBe('test');
      expect(issuer.environmentDetails[1].issuerUrl).toBe(process.env.OIDC_ISSUER);
      expect(issuer.environmentDetails[1].clientId).toBe(
        `ap-my-auth-profile-for-${gateway.gatewayId}-test`
      );
    });
  });
}); 