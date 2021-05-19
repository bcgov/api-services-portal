

export function scopesToRoles (scopeString: string) {
    const scopes = scopeString.split(' ')
    const _roles = []
    if (scopes.includes('Namespace.Manage')) {
        _roles.push('api-owner')
    } else {
        // For now, make everyone an api-owner if they have access to a namespace
        _roles.push('api-owner')
    }
    if (scopes.includes('Namespace.Manage')) {
        _roles.push('credential-admin')
    }      
    return JSON.stringify(_roles)
}