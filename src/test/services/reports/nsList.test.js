import fetch from 'node-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { generateExcelWorkbook } from '../../../services/report/output/xls-generator';

const fullJson = {
  namespaces: [
    {
      name: 'ns_1',
      perm_protected_ns: ['allow'],
      perm_domains: ['*.api.gov.bc.ca', '*.apps.gov.bc.ca'],
      perm_data_plane: ['dp-silver-kong-proxy'],
    },
  ],
  ns_access: [
    {
      namespace: 'ns_1',
      subject: 'jone@idir',
      scope: 'Namespace.Manage',
    },
    {
      namespace: 'ns_1',
      subject: 'sa-sampler-ca853245-5d50c2a8908c',
      scope: 'Namespace.Manage',
    },
  ],
  gateway_metrics: [
    {
      namespace: 'ns_1',
      prod_name: 'My API',
      prod_env_name: 'prod',
      service_name: 'a-service-for-moh-proto',
      day_30_total: 102020,
    },
  ],
  gateway_controls: [
    {
      namespace: 'ns_1',
      prod_name: 'My API',
      prod_env_name: 'prod',
      service_name: 'a-service-for-moh-proto',
      route_name: '',
      plugin_name: 'acl',
      plugin_info: '',
    },
  ],
  consumer_access: [
    {
      namespace: 'ns_1',
      prod_name: 'My API',
      prod_env_name: 'prod',
      prod_env_flow: 'kong-api-key-with-acl',
      prod_env_issuer: '',
      consumer_username: '535C4DF2-C9B0DCAC68DC45C9',
      consumer_updated: '2021-09-28T05:23:32.291Z',
      idp_client_id: '',
      app_name: 'Mart 123',
      app_id: 'C9B0DCAC68DC45C9',
      app_owner: 'acope@idir',
      perm_acl: '',
      perm_scope: 'System.*',
      perm_role: '',
    },
  ],
  consumer_metrics: [
    {
      namespace: 'ns_1',
      consumer_username: 'acope@idir',
      prod_name: 'My API',
      prod_env_name: 'prod',
      service_name: 'a-service-for-moh-proto',
      day_30_total: 102020,
    },
  ],
  consumer_controls: [
    {
      namespace: 'ns_1',
      consumer_username: '535C4DF2-C9B0DCAC68DC45C9',
      prod_name: 'My API',
      prod_env_name: 'prod',
      service_name: 'a-service-for-moh-proto',
      route_name: '',
      plugin_name: 'rate-limiting',
      plugin_info: 'local (10 req/min)',
    },
  ],
};

const short = {
  namespaces: [
    {
      name: 'ns_1',
      perm_protected_ns: ['allow'],
      perm_domains: ['*.api.gov.bc.ca', '*.apps.gov.bc.ca'],
      perm_data_plane: ['dp-silver-kong-proxy'],
    },
  ],
  ns_access: [
    {
      namespace: 'ns_1',
      subject: 'jone@idir',
      scope: 'Namespace.Manage',
    },
    {
      namespace: 'ns_1',
      subject: 'sa-sampler-ca853245-5d50c2a8908c',
      scope: 'Namespace.Manage',
    },
  ],
  gateway_metrics: [
    {
      namespace: 'ns_1',
      service_name: 'a-service-for-moh-proto',
      day_30_total: 102020,
    },
  ],
};

describe('Generate Namespace Reports', function () {
  const server = setupServer(
    rest.get('http://hello', (req, res, ctx) => {
      return res(
        ctx.json({
          message: 'hello',
        })
      );
    })
  );

  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe('output namespace list', function () {
    it('it should generate report', async function () {
      const workbook = generateExcelWorkbook(fullJson);
      //await workbook.xlsx.writeFile('test.xlsx');
    });
    it('it should generate report from short data', async function () {
      const workbook = generateExcelWorkbook(short);
      //await workbook.xlsx.writeFile('test2.xlsx');
    });
  });
});
