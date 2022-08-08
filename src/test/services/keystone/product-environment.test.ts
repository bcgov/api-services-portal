// Lookup product environments with appId (for ACL), cred issuer and services information
import { CredentialIssuer, GatewayService } from '@/services/keystone/types';
import {
  lookupProductEnvironmentServices,
  lookupEnvironmentAndIssuerById,
} from '../../../services/keystone';

import Context from '../../mocks/handlers/keystone';

const context = Context('default');

describe('KeystoneJS', function () {
  describe('test lookupProductEnvironmentServices', function () {
    it('it should be successful', async function () {
      const environment = await lookupProductEnvironmentServices(
        context,
        '61204beaa988d4127e1d4892'
      );
      expect(environment.appId).toBe('DBA44A4F');
    });
  });

  describe('test lookupEnvironmentAndIssuerById', function () {
    it('it should be successful', async function () {
      const environment = await lookupEnvironmentAndIssuerById(
        context,
        '609c5bf79b8ceca36d31ce94'
      );
      expect(environment.name).toBe('dev');
    });
  });
});
