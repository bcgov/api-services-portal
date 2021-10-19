export const clientTemplateClientSecret = JSON.stringify({
  clientId: '',
  name: '',
  description: '',
  surrogateAuthRequired: false,
  enabled: false,
  alwaysDisplayInConsole: false,
  clientAuthenticatorType: 'client-secret',
  redirectUris: ['https://*'],
  webOrigins: ['*'],
  notBefore: 0,
  bearerOnly: false,
  consentRequired: false,
  standardFlowEnabled: false,
  implicitFlowEnabled: false,
  directAccessGrantsEnabled: false,
  serviceAccountsEnabled: true,
  publicClient: false,
  frontchannelLogout: false,
  protocol: 'openid-connect',
  attributes: {
    'saml.assertion.signature': 'false',
    'saml.multivalued.roles': 'false',
    'saml.force.post.binding': 'false',
    'saml.encrypt': 'false',
    'saml.server.signature': 'false',
    'saml.server.signature.keyinfo.ext': 'false',
    'exclude.session.state.from.auth.response': 'false',
    'client_credentials.use_refresh_token': 'false',
    saml_force_name_id_format: 'false',
    'saml.client.signature': 'false',
    'tls.client.certificate.bound.access.tokens': 'false',
    'saml.authnstatement': 'false',
    'display.on.consent.screen': 'false',
    'saml.onetimeuse.condition': 'false',
  },
  authenticationFlowBindingOverrides: {},
  fullScopeAllowed: false,
  nodeReRegistrationTimeout: -1,
  protocolMappers: [] as any[],
  defaultClientScopes: [] as string[],
  optionalClientScopes: [] as string[],
  access: { view: true, configure: true, manage: true },
});
