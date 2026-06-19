export const Environments: Record<
  string,
  { client_id?: string; oauth_token_url: string }
> = {
  sbx: {
    client_id: 'aps-kong-gw-20771',
    oauth_token_url:
      'https://dev.sandbox.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/token',
  },
  dev: {
    client_id: 'aps-kong-gw-20771',
    oauth_token_url:
      'https://dev.sandbox.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/token',
  },
  test: {
    oauth_token_url:
      'https://test.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/token',
  },
  prod: {
    oauth_token_url:
      'https://loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/token',
  },
};
