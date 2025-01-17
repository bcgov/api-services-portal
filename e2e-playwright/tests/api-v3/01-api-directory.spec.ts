import { test, expect } from '@playwright/test';
import { callAPI, setRequestBody, setHeaders } from '../../helpers/api-helpers';
import { buildOrgGatewayDatasetAndProduct } from '../../helpers/setup-helpers';

test.describe('API Directory', () => {
  let workingData: any;

  test.beforeAll(async ({ request }) => {
    workingData = await buildOrgGatewayDatasetAndProduct(request);
  });

  test.describe('API Directory (Public)', () => {
    test('PUT /organizations/{org}/datasets (resources/contacts)', async ({ request }) => {
      const { org, gateway, dataset, datasetId, product } = workingData;

      const payload = {
        name: `org-dataset-${datasetId}-res`,
        license_title: 'Open Government Licence - British Columbia',
        security_class: 'PUBLIC',
        view_audience: 'Public',
        download_audience: 'Public',
        record_publish_date: '2017-09-05',
        notes: 'Some notes',
        title: 'A title about my dataset',
        tags: ['tag1', 'tag2'],
        organization: org.name,
        organizationUnit: org.orgUnits[0].name,
        resources: [{
          name: 'API Doc',
          url: 'https://raw.githubusercontent.com/bcgov/api-specs/master/bcdc/bcdc.json',
          format: 'openapi-json',
        }],
        contacts: [{
          name: 'Joe Smith',
          email: 'joe@gov.bc.ca',
          role: 'pointOfContact',
        }],
      };

      setRequestBody(payload);
      const putResponse = await callAPI(request, `organizations/${org.name}/datasets`, 'PUT');
      expect(putResponse.apiRes.status).toBe(200);

      const getResponse = await callAPI(request, `organizations/${org.name}/datasets/${payload.name}`, 'GET');
      expect(getResponse.apiRes.status).toBe(200);

      const match = {
        name: payload.name,
        license_title: 'Open Government Licence - British Columbia',
        security_class: 'PUBLIC',
        view_audience: 'Public',
        download_audience: 'Public',
        record_publish_date: '2017-09-05',
        notes: 'Some notes',
        title: 'A title about my dataset',
        isInCatalog: false,
        isDraft: true,
        contacts: [{
          role: 'pointOfContact',
          name: 'Joe Smith',
          email: 'joe@gov.bc.ca',
        }],
        resources: [{
          name: 'API Doc',
          url: 'https://raw.githubusercontent.com/bcgov/api-specs/master/bcdc/bcdc.json',
          format: 'openapi-json',
        }],
        tags: ['tag1', 'tag2'],
        organization: {
          name: org.name,
          title: 'Some good title about kittens',
          tags: [],
          description: 'Some good description about kittens',
        },
        organizationUnit: {
          name: org.orgUnits[0].name,
          title: 'Division of fun toys to play',
          tags: [],
          description: 'Some good description about how we manage our toys',
        },
      };

      expect(JSON.stringify(getResponse.apiRes.body)).toBe(JSON.stringify(match));
      expect(JSON.stringify(getResponse.apiRes.body.contacts)).toBe(JSON.stringify(match.contacts));
      expect(JSON.stringify(getResponse.apiRes.body.resources)).toBe(JSON.stringify(match.resources));
    });

    test('GET /directory', async ({ request }) => {
      const response = await callAPI(request, 'directory', 'GET');
      expect(response.apiRes.status).toBe(200);
      expect(response.apiRes.body.length).toBeGreaterThan(0);
    });

    test('GET /directory/{datasetId}', async ({ request }) => {
      const { org, gateway, dataset, datasetId, product } = workingData;
      
      const response = await callAPI(request, `directory/${datasetId}`, 'GET');
      expect(response.apiRes.status).toBe(200);

      const match = {
        name: dataset.name,
        title: 'A title about my dataset',
        notes: 'Some notes',
        license_title: 'Open Government Licence - British Columbia',
        security_class: 'PUBLIC',
        view_audience: 'Public',
        tags: ['tag1', 'tag2'],
        record_publish_date: '2017-09-05',
        isInCatalog: false,
        organization: {
          name: org.name,
          title: 'Some good title about kittens',
        },
        organizationUnit: {
          name: org.orgUnits[0].name,
          title: 'Division of fun toys to play',
        },
        products: [{
          name: `my-product-on-${gateway.gatewayId}`,
          environments: [{
            name: 'dev',
            active: true,
            flow: 'public',
            services: [],
          }],
        }],
      };

      delete response.apiRes.body.products[0].id;
      expect(JSON.stringify(response.apiRes.body)).toBe(JSON.stringify(match));
    });
  });

  test.describe('API Directory (Gateway Management)', () => {
    test('GET /gateways/{gatewayId}/datasets/{name}', async ({ request }) => {
      const { org, gateway, dataset, datasetId, product } = workingData;
      
      const response = await callAPI(request, `gateways/${gateway.gatewayId}/datasets/${dataset.name}`, 'GET');
      expect(response.apiRes.status).toBe(200);

      const match = {
        name: dataset.name,
        license_title: 'Open Government Licence - British Columbia',
        security_class: 'PUBLIC',
        view_audience: 'Public',
        download_audience: 'Public',
        record_publish_date: '2017-09-05',
        notes: 'Some notes',
        title: 'A title about my dataset',
        isInCatalog: false,
        isDraft: true,
        contacts: [],
        resources: [],
        tags: ['tag1', 'tag2'],
        organization: {
          name: org.name,
          title: 'Some good title about kittens',
          tags: [],
          description: 'Some good description about kittens',
        },
        organizationUnit: {
          name: org.orgUnits[0].name,
          title: 'Division of fun toys to play',
          tags: [],
          description: 'Some good description about how we manage our toys',
        },
      };

      delete response.apiRes.body.id;
      expect(JSON.stringify(response.apiRes.body)).toBe(JSON.stringify(match));
    });

    test('GET /gateways/{gatewayId}/directory', async ({ request }) => {
      const { org, gateway, dataset, datasetId, product } = workingData;
      
      const response = await callAPI(request, `gateways/${gateway.gatewayId}/directory`, 'GET');
      expect(response.apiRes.status).toBe(200);

      const match = [{
        name: dataset.name,
        title: 'A title about my dataset',
        notes: 'Some notes',
        license_title: 'Open Government Licence - British Columbia',
        view_audience: 'Public',
        security_class: 'PUBLIC',
        record_publish_date: '2017-09-05',
        tags: ['tag1', 'tag2'],
        organization: {
          name: org.name,
          title: 'Some good title about kittens',
        },
        organizationUnit: {
          name: org.orgUnits[0].name,
          title: 'Division of fun toys to play',
        },
        products: [{
          name: product.name,
          environments: [{ name: 'dev', active: true, flow: 'public' }],
        }],
      }];

      delete response.apiRes.body[0].products[0].id;
      delete response.apiRes.body[0].id;
      expect(JSON.stringify(response.apiRes.body)).toBe(JSON.stringify(match));
    });

    test('GET /gateways/{gatewayId}/directory/{id}', async ({ request }) => {
      const { org, gateway, dataset, datasetId, product } = workingData;
      
      const response = await callAPI(request, `gateways/${gateway.gatewayId}/directory/${datasetId}`, 'GET');
      expect(response.apiRes.status).toBe(200);

      const match = {
        name: dataset.name,
        title: 'A title about my dataset',
        notes: 'Some notes',
        license_title: 'Open Government Licence - British Columbia',
        security_class: 'PUBLIC',
        view_audience: 'Public',
        tags: ['tag1', 'tag2'],
        record_publish_date: '2017-09-05',
        isInCatalog: false,
        organization: {
          name: org.name,
          title: 'Some good title about kittens',
        },
        organizationUnit: {
          name: org.orgUnits[0].name,
          title: 'Division of fun toys to play',
        },
        products: [{
          name: product.name,
          environments: [{ name: 'dev', active: true, flow: 'public', services: [] }],
        }],
      };

      delete response.apiRes.body.products[0].id;
      delete response.apiRes.body.id;
      expect(JSON.stringify(response.apiRes.body)).toBe(JSON.stringify(match));
    });
  });
});