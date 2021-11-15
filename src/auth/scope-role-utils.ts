export function scopes(scopeString: string) {
  return scopeString.split(' ');
}

export function scopesToRoles(username: string, scopes: string[]): string[] {
  const _roles = [];
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
  if (username != null) {
    _roles.push(deriveRoleFromUsername(username));
  }
  return _roles;
}

export function deriveRoleFromUsername(username: string) {
  const parts = username.split('@');
  return parts.length == 1 ? 'developer' : `${parts[1]}-user`;
}
