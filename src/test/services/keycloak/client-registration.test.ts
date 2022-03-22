import {
  KeycloakClientRegistrationService,
  ClientAuthenticator,
} from '../../../services/keycloak';

describe('Keycloak Service', function () {
  describe('keycloak client registration', function () {
    it('it should return a successful response for Secret', async function () {
      const regsvc = new KeycloakClientRegistrationService(
        'https://provider/issuer',
        'https://provider/auth/realms/my-realm/clients-registrations/default',
        'token'
      );
      const result = await regsvc.clientRegistration(
        ClientAuthenticator.ClientSecret,
        'cid',
        'csc',
        'cert',
        'jwks',
        [],
        true
      );
      expect(result.registrationAccessToken).toBe('token-123');
      expect(result.clientSecret).toBe('csc');
    });
    it('it should return a successful response for Cert', async function () {
      const regsvc = new KeycloakClientRegistrationService(
        'https://provider/issuer',
        'https://provider/auth/realms/my-realm/clients-registrations/default',
        'token'
      );
      const result = await regsvc.clientRegistration(
        ClientAuthenticator.ClientJWTwithJWKS,
        'cid',
        'csc',
        'cert',
        'jwks',
        [],
        true
      );
      expect(result.registrationAccessToken).toBe('token-123');
      expect(result.clientSecret).toBeNull();
    });
  });
});
