import { test, expect } from '@playwright/test';
import { callAPI, setRequestBody, setHeaders } from '../../helpers/api-helpers';
import { loginByAuthAPI } from '../../helpers/setup-helpers';

test.describe('Organization', () => {
  test.beforeAll(async ({ request }) => {
    const tokenRes = await loginByAuthAPI(request);
    setHeaders({ 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenRes.token}`
    });
  });

  test('GET /organizations', async ({ request }) => {
    const response = await callAPI(request, 'organizations', 'GET');
    expect(response.apiRes.status).toBe(200);
    expect(response.apiRes.body.filter((o: any) => o.name == 'ministry-of-health').length).toBe(1);
  });

  test('GET /organizations/{org}', async ({ request }) => {
    const response = await callAPI(request, 'organizations/ministry-of-health', 'GET');
    expect(response.apiRes.status).toBe(200);
    expect(response.apiRes.body.orgUnits.filter((o: any) => o.name == 'public-health').length).toBe(1);
  });

  test('GET /organizations/{org}/roles', async ({ request }) => {
    const match = {
      name: 'ministry-of-health',
      parent: '/ca.bc.gov',
      roles: [
        {
          name: 'organization-admin',
          permissions: [
            {
              resource: 'org/ministry-of-health',
              scopes: ['Dataset.Manage', 'GroupAccess.Manage', 'Namespace.Assign'],
            },
          ],
        },
      ],
    };

    const response = await callAPI(request, 'organizations/ministry-of-health/roles', 'GET');
    expect(response.apiRes.status).toBe(200);
    expect(JSON.stringify(response.apiRes.body)).toBe(JSON.stringify(match));
  });

  test('GET /organizations/{org}/access', async ({ request }) => {
    // ignore specific member contents since previous tests will have created members 
    const match = {
      name: 'ministry-of-health',
      parent: '/ca.bc.gov',
    };
  
    const response = await callAPI(request, 'organizations/ministry-of-health/access', 'GET');
    expect(response.apiRes.status).toBe(200);
    expect(response.apiRes.body).toMatchObject(match);
    expect(Array.isArray(response.apiRes.body.members)).toBe(true);
  });

  test('PUT /organizations/{org}/access', async ({ request }) => {
    const payload = {
      name: 'planning-and-innovation-division',
      parent: '/ca.bc.gov/ministry-of-health',
      members: [
        {
          member: {
            email: 'mark@gmail.com',
          },
          roles: ['organization-admin'],
        },
      ],
    };
    
    setRequestBody(payload);
    const putResponse = await callAPI(
      request,
      'organizations/planning-and-innovation-division/access',
      'PUT'
    );
    expect(putResponse.apiRes.status).toBe(204);

    const getResponse = await callAPI(
      request,
      'organizations/planning-and-innovation-division/access',
      'GET'
    );
    expect(getResponse.apiRes.status).toBe(200);

    const match = {
      name: 'planning-and-innovation-division',
      parent: '/ca.bc.gov/ministry-of-health',
      members: [
        {
          member: {
            username: 'mark@idir',
            email: 'mark@gmail.com',
          },
          roles: ['organization-admin'],
        },
      ],
    };

    // ignore the ID as it will always be different
    getResponse.apiRes.body.members.forEach((m: any) => {
      delete m.member.id;
    });
    expect(JSON.stringify(getResponse.apiRes.body)).toBe(JSON.stringify(match));
  });

  test('GET /organizations/{org}/gateways', async ({ request }) => {
    const match = {
      name: 'platform',
      orgUnit: 'planning-and-innovation-division',
      enabled: false,
      updatedAt: 0,
    };

    const response = await callAPI(request, 'organizations/ministry-of-health/gateways', 'GET');
    expect(response.apiRes.status).toBe(200);
    expect(
      JSON.stringify(response.apiRes.body.filter((a: any) => a.name == 'platform').pop())
    ).toBe(JSON.stringify(match));
  });

  test('GET /organizations/{org}/activity', async ({ request }) => {
    // First attempt
    const response = await callAPI(request, 'organizations/ministry-of-health/activity', 'GET');
    
    if (response.apiRes.status === 422) {
      // If we get a 422, wait and retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      const retryResponse = await callAPI(request, 'organizations/ministry-of-health/activity', 'GET');
      expect(retryResponse.apiRes.status).toBe(200);
    } else {
      expect(response.apiRes.status).toBe(200);
    }
  });

  test('PUT /organizations/{org}/{orgUnit}/gateways/{gatewayId}', async ({ request }) => {
    setRequestBody({});
    const gatewayResponse = await callAPI(request, 'gateways', 'POST');
    expect(gatewayResponse.apiRes.status).toBe(200);
    const myGateway = gatewayResponse.apiRes.body;

    setRequestBody({});
    const assignResponse = await callAPI(
      request,
      `organizations/ministry-of-health/planning-and-innovation-division/gateways/${myGateway.gatewayId}?enable=true`,
      'PUT'
    );
    expect(assignResponse.apiRes.status).toBe(200);
    expect(assignResponse.apiRes.body.result).toBe('namespace-assigned');
  });

  test('GET /roles', async ({ request }) => {
    const match = {
      'organization-admin': {
        label: 'Organization Administrator',
        permissions: [
          {
            resourceType: 'organization',
            scopes: ['GroupAccess.Manage', 'Namespace.Assign', 'Dataset.Manage'],
          },
          { resourceType: 'namespace', scopes: ['Namespace.View'] },
        ],
      },
    };

    const response = await callAPI(request, 'roles', 'GET');
    expect(response.apiRes.status).toBe(200);
    expect(JSON.stringify(response.apiRes.body)).toBe(JSON.stringify(match));
  });
}); 