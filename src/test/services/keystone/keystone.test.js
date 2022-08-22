import {
  lookupProductEnvironmentServices,
  linkCredRefsToServiceAccess,
  lookupEnvironmentAndApplicationByAccessRequest,
  lookupKongConsumerIdByName,
  lookupCredentialIssuerById,
  addKongConsumer,
  addServiceAccess,
} from '../../../services/keystone';

import Context from '../../mocks/handlers/keystone';

const context = Context('default');

describe('KeystoneJS', function () {
  describe('test lookupProductEnvironmentServices', function () {
    it('it should be successful', async function () {
      const result = await lookupProductEnvironmentServices(
        context,
        'PROD-ENV-ID-1'
      );
      expect(result.name).toBe('dev');
      expect(result.services.length).toBe(1);
    });
  });

  describe('test lookupEnvironmentAndApplicationByAccessRequest', function () {
    it('it should be successful', async function () {
      const result = await lookupEnvironmentAndApplicationByAccessRequest(
        context,
        'ENV-ID-1'
      );
      expect(result.productEnvironment.name).toBe('ENV-NAME');
    });
  });

  describe('test lookupKongConsumerIdByName', function () {
    it('it should be successful', async function () {
      const result = await lookupKongConsumerIdByName(context, 'ENV-ID-1');
      expect(result).toBe('CONSUMER-001');
    });
  });

  describe('test lookupCredentialIssuerById', function () {
    it('it should be successful', async function () {
      const result = await lookupCredentialIssuerById(context, 'ID-1');
      expect(result.name).toBe('ISSUER-001');
    });
  });

  // addKongConsumer
  describe('test addKongConsumer', function () {
    it('it should be successful', async function () {
      const result = await addKongConsumer(
        context,
        'USERNAME-1',
        'CONSUMER-ID'
      );
      expect(result).toBe('CONSUMER-001');
    });
  });

  // addServiceAccess
  describe('test addServiceAccess', function () {
    it('it should be successful', async function () {
      const result = await addServiceAccess(
        context,
        'App8.Prod8.Env',
        true,
        true,
        'client',
        null,
        null,
        null,
        { id: 'PROD-ENV-01' },
        null
      );
      expect(result).toBe('SVC-ACCESS-002');
    });
  });

  // linkCredRefsToServiceAccess
  describe('test linkCredRefsToServiceAccess', function () {
    it('it should be successful', async function () {
      const result = await linkCredRefsToServiceAccess(
        context,
        'SVC-ACCESS-01',
        { apiKey: 'sss' }
      );
      expect(result.id).toBe('SVC-ACCESS-001');
    });
  });
});
