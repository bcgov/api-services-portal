import { KeycloakClientService } from '../../../services/keycloak';

describe('Keycloak Client Service', function () {
  it('it should lookupServiceAccountUserId', async function () {
    const kc = new KeycloakClientService(
      'https://provider/realms/abc',
      'token'
    );
    const result = await kc.lookupServiceAccountUserId('cid');
    expect(result).toBe('f6255ce4-895a-4965-b7ec-c93ad80dec48');
  });

  it('it should listDefaultScopes', async function () {
    const kc = new KeycloakClientService(
      'https://provider/realms/abc',
      'token'
    );
    const result = await kc.listDefaultScopes('cid');
    expect(result.length).toBe(3);
    expect(result[2].name).toBe('profile');
  });

  it('it should listRoles', async function () {
    const kc = new KeycloakClientService(
      'https://provider/realms/abc',
      'token'
    );
    const result = await kc.listRoles('cid');
    expect(result.length).toBe(4);
    expect(result[3].name).toBe('api-owner');
  });

  it('it should findByClientId', async function () {
    const kc = new KeycloakClientService(
      'https://provider/realms/abc',
      'token'
    );
    const result = await kc.findByClientId('56CED0AE11DE47E3-CA853245');
    expect(result.id).toBe('acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81');
  });
});
