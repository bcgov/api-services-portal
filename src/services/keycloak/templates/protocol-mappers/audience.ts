export function AudienceMapper(value: string) {
  return {
    name: 'audience',
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
