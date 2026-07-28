import { scopesToRoles } from '../../auth/scope-role-utils';

describe('scopesToRoles CredentialIssuer.Generate', function () {
  it('maps CredentialIssuer.Generate to credential-issuer role', function () {
    const roles = scopesToRoles('idir', ['CredentialIssuer.Generate']);
    expect(roles).toContain('credential-issuer');
    expect(roles).toContain('portal-user');
    expect(roles).toContain('idir-user');
  });

  it('maps both Admin and Generate independently', function () {
    const roles = scopesToRoles('idir', [
      'CredentialIssuer.Admin',
      'CredentialIssuer.Generate',
    ]);
    expect(roles).toContain('credential-admin');
    expect(roles).toContain('credential-issuer');
  });
});
