export function AudienceMapper(name: string, value: string) {
  return {
    name,
    protocol: 'openid-connect',
    protocolMapper: 'oidc-audience-mapper',
    consentRequired: false,
    config: {
      'id.token.claim': 'false',
      'access.token.claim': 'true',
      'included.custom.audience': value,
    },
  };
}
