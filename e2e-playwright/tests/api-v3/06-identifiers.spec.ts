import { test, expect } from '@playwright/test';
import { callAPI } from '../../helpers/api-helpers';

test.describe('Identifiers', () => {
  test('GET /identifiers/application', async ({ request }) => {
    const response = await callAPI(request, 'identifiers/application', 'GET');
    console.log(`ID ${response.apiRes.body}`);
    expect(response.apiRes.status).toBe(200);
  });

  test('GET /identifiers/product', async ({ request }) => {
    const response = await callAPI(request, 'identifiers/product', 'GET');
    console.log(`ID ${response.apiRes.body}`);
    expect(response.apiRes.status).toBe(200);
  });

  test('GET /identifiers/environment', async ({ request }) => {
    const response = await callAPI(request, 'identifiers/environment', 'GET');
    console.log(`ID ${response.apiRes.body}`);
    expect(response.apiRes.status).toBe(200);
  });

  test('GET /identifiers/gateway', async ({ request }) => {
    const response = await callAPI(request, 'identifiers/gateway', 'GET');
    console.log(`ID ${response.apiRes.body}`);
    expect(response.apiRes.status).toBe(200);
  });
}); 