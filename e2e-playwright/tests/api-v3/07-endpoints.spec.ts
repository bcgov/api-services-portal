import { exec } from 'child_process';
import { test, expect } from '@playwright/test';
import { callAPI } from '../../helpers/api-helpers';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { promisify } from 'util';
const execAsync = promisify(exec);

test.describe('Endpoints - unused service', () => {
  test('GET /routes/availability', async ({ request }) => {
    const response = await callAPI(
      request,
      'routes/availability?gatewayId=gw-1234&serviceName=testme',
      'GET'
    );
    
    const match = {
      available: true,
      suggestion: {
        serviceName: 'testme',
        names: ['testme', 'testme-dev', 'testme-test'],
        hosts: [
          'testme.api.gov.bc.ca',
          'testme.dev.api.gov.bc.ca',
          'testme.test.api.gov.bc.ca',
          'testme-api-gov-bc-ca.dev.api.gov.bc.ca',
          'testme-api-gov-bc-ca.test.api.gov.bc.ca',
        ],
      },
    };
    
    expect(response.apiRes.status).toBe(200);
    expect(JSON.stringify(response.apiRes.body)).toBe(JSON.stringify(match));
  });
});

const randomId = uuidv4().replace(/-/g, '').substring(0, 4);

test.describe('Endpoints - used service', () => {
  let authToken: string;
  let commonTestData: any;

  test.beforeAll(async () => {
    // Load test data
    const testDataPath = path.join(__dirname, '../../fixtures/common-testdata.json');
    commonTestData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
  });

  test('Log in and get access token', async ({ page }) => {
    await page.goto('/login?identity=provider&f=%2Fauth_callback%3Fidentity%3Dprovider');
    await page.getByTestId('login-with-idir').click();
    await page.getByLabel('Username').click();
    await page.getByLabel('Username').fill('janis@idir');
    await page.getByLabel('Username').press('Tab');
    await page.getByLabel('Password').fill('awsummer');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByTestId('auth-menu-user')).toContainText('JS');
    
    const [response] = await Promise.all([
      page.waitForResponse('**/admin/session'),
      page.goto('/admin/session')
    ]);
    authToken = response.headers()['x-auth-request-access-token'];
  });

  test('Set CLI environment', async ({ baseURL}) => {
    const cleanedUrl = baseURL.replace(/^http?:\/\//i, '');
    const command = `gwa config set --host ${cleanedUrl} --scheme http`;
    const { stdout } = await execAsync(command);
    expect(stdout).toContain('Config settings saved');
  });

  test('Set CLI token', async () => {
    const command = `gwa config set --token ${authToken}`;
    const { stdout } = await execAsync(command);
    expect(stdout).toContain('Config settings saved');
  });

  test('Create namespace with CLI', async () => {
    const { serviceAvailability } = await commonTestData;
    const command = `gwa gateway create --gateway-id ${serviceAvailability.namespace}-${randomId} --display-name="Service Availability"`;
    const { stdout } = await execAsync(command);
    expect(stdout).toContain(`${serviceAvailability.namespace}-${randomId}`);
  });

  test('Apply config for a service', async () => {
    const { serviceAvailability } = await commonTestData;
    // Read and modify the config file content
    const configPath = path.join(__dirname, '../../fixtures/service-availability.yml');
    let configContent = fs.readFileSync(configPath, 'utf8');
    configContent = configContent.replace(/service-av/g, `${serviceAvailability.namespace}-${randomId}`);
    configContent = configContent.replace(/taken-service-name/g, `taken-service-name-${randomId}`);
    
    // Write to a temporary file
    const tempConfigPath = path.join(__dirname, '../../fixtures/temp-service-availability.yml');
    fs.writeFileSync(tempConfigPath, configContent);
    
    const command = `gwa apply -i ./fixtures/temp-service-availability.yml`;
    const { stdout } = await execAsync(command);
    expect(stdout).toContain('Gateway Services published');
  });

  test('GET /routes/availability for used service', async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const response = await callAPI(
      request,
      `routes/availability?gatewayId=gw-1234&serviceName=taken-service-name-${randomId}`,
      'GET'
    );
    
    const match = {
      available: false,
      suggestion: {
        serviceName: `gw-1234-taken-service-name-${randomId}`,
        names: [
          `gw-1234-taken-service-name-${randomId}`,
          `gw-1234-taken-service-name-${randomId}-dev`,
          `gw-1234-taken-service-name-${randomId}-test`
        ],
        hosts: [
          `gw-1234-taken-service-name-${randomId}.api.gov.bc.ca`,
          `gw-1234-taken-service-name-${randomId}.dev.api.gov.bc.ca`,
          `gw-1234-taken-service-name-${randomId}.test.api.gov.bc.ca`,
          `gw-1234-taken-service-name-${randomId}-api-gov-bc-ca.dev.api.gov.bc.ca`,
          `gw-1234-taken-service-name-${randomId}-api-gov-bc-ca.test.api.gov.bc.ca`
        ]
      },
    };
    
    expect(response.apiRes.status).toBe(200);
    expect(JSON.stringify(response.apiRes.body)).toBe(JSON.stringify(match));
  });
}); 