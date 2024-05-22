export function scopes(scopeString: string) {
  return scopeString.split(' ');
}

export function scopesToRoles(
  identityProvider: string,
  scopes: string[]
): string[] {
  const _roles = [] as string[];
  if (scopes.includes('Namespace.Manage')) {
    _roles.push('api-owner');
  }
  if (scopes.includes('Namespace.View')) {
    _roles.push('provider-user');
  }
  if (scopes.includes('CredentialIssuer.Admin')) {
    _roles.push('credential-admin');
  }
  if (scopes.includes('Access.Manage')) {
    _roles.push('access-manager');
  }

  _roles.push('portal-user');
  _roles.push(deriveRoleFromIdP(identityProvider));
  return _roles;
}

export function deriveRoleFromIdP(identityProvider: string) {
  return identityProvider ? `${identityProvider}-user` : 'developer';
}
