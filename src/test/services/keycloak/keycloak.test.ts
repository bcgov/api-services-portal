import { getOpenidFromDiscovery } from '../../../services/keycloak';

describe('Keycloak Service', function () {
  describe('keycloak ', function () {
    it('it should getOpenidFromDiscovery', async function () {
      const openid = await getOpenidFromDiscovery(
        'https://provider/auth/realms/my-realm/.well-known/openid-configuration'
      );
      expect(openid.issuer).toBe(
        'https://authz-backchannel/auth/realms/REALMID'
      );
    });
    it('it should return null due to bad url', async function () {
      expect(
        await getOpenidFromDiscovery(
          'https://elsewhere/auth/realms/my-realm/.well-known/openid-configuration'
        )
      ).toBe(null);
    });
  });
});
