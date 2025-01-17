import { test, expect } from '@playwright/test';
import { callAPI } from '../../helpers/api-helpers';
import * as fs from 'fs';
import * as path from 'path';

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

// The below test is commented out because it requires more 
// elaborate setup to run.

// test.describe('Endpoints - used service', () => {
//   let userSession: string;
//   let commonTestData: any;

//   test.beforeAll(async () => {
//     // Load test data
//     const testDataPath = path.join(__dirname, '../../fixtures/common-testdata.json');
//     commonTestData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
//   });

//   test('GET /routes/availability for used service', async ({ request }) => {
//     const response = await callAPI(
//       request,
//       'routes/availability?gatewayId=gw-1234&serviceName=taken-service-name',
//       'GET'
//     );
    
//     const match = {
//       available: false,
//       suggestion: {
//         serviceName: "gw-1234-taken-service-name",
//         names: [
//           "gw-1234-taken-service-name",
//           "gw-1234-taken-service-name-dev",
//           "gw-1234-taken-service-name-test"
//         ],
//         hosts: [
//           "gw-1234-taken-service-name.api.gov.bc.ca",
//           "gw-1234-taken-service-name.dev.api.gov.bc.ca",
//           "gw-1234-taken-service-name.test.api.gov.bc.ca",
//           "gw-1234-taken-service-name-api-gov-bc-ca.dev.api.gov.bc.ca",
//           "gw-1234-taken-service-name-api-gov-bc-ca.test.api.gov.bc.ca"
//         ]
//       },
//     };
    
//     expect(response.apiRes.status).toBe(200);
//     expect(JSON.stringify(response.apiRes.body)).toBe(JSON.stringify(match));
//   });
// }); 