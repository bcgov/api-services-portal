export function UsernameMapper() {
  return {
    name: 'username',
    protocol: 'openid-connect',
    protocolMapper: 'oidc-usermodel-property-mapper',
    consentRequired: false,
    config: {
      'claim.name': 'preferred_username',
      'id.token.claim': 'true',
      'access.token.claim': 'true',
      'userinfo.token.claim': 'true',
      'user.attribute': 'username',
      'jsonType.label': 'String',
    },
  };
}
