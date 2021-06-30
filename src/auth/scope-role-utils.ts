export function scopes(scopeString: string) {
  return scopeString.split(' ');
}

export function scopesToRoles(scopes: string[]) {
  const _roles = [];
  if (scopes.includes('Namespace.Manage')) {
    _roles.push('api-owner');
  } else {
    // For now, make everyone an api-owner if they have access to a namespace
    _roles.push('api-owner');
  }
  if (scopes.includes('Namespace.Manage')) {
    _roles.push('credential-admin');
  }
  return JSON.stringify(_roles);
}

export function deriveRoleFromUsername(username: string) {
  const parts = username.split('@');
  return parts.length == 1 ? 'developer' : `${parts[1]}-user`;
}
