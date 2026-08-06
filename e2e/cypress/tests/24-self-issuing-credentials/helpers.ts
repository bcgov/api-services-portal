/**
 * Shared helpers for the independent 24-self-issuing-credentials suite.
 * Runtime state is kept in fixtures/state/24-self-issue.json (not shared store.json).
 */

export const SUITE_STATE_PATH = 'cypress/fixtures/state/24-self-issue.json'
export const SUITE_FIXTURE_DIR = '24-self-issuing-credentials'

export type SuiteCredentials = {
  clientId: string
  clientSecret: string
}

export type FlowEnv = {
  name: 'dev' | 'test'
  environmentAppId: string
  serviceName: string
  host: string
}

export type FlowConfig = {
  key: string
  productName: string
  flow: 'kong-api-key-only' | 'kong-api-key-acl' | 'client-credentials'
  authenticator?: 'client-secret' | 'client-jwt' | 'client-jwt-jwks-url'
  issuerName?: string
  envs: FlowEnv[]
}

export type SuiteState = {
  gatewayId: string
  displayName?: string
  issuerSa: SuiteCredentials
  controlSa: SuiteCredentials
  publishSa: SuiteCredentials
  flows: Record<string, FlowConfig>
}

export const FLOW_KEYS = {
  apiKeyOnly: 'apiKeyOnly',
  apiKeyAcl: 'apiKeyAcl',
  clientSecret: 'clientSecret',
  clientJwt: 'clientJwt',
  clientJwks: 'clientJwks',
} as const

const AUTH_PROFILE_CLIENT = {
  clientId: 'cypress-auth-profile',
  clientSecret: '43badfc1-c06f-4bec-bab6-ccdc764071ac',
}

export function saveSuiteState(state: SuiteState): Cypress.Chainable<any> {
  return cy.writeFile(SUITE_STATE_PATH, state, { log: true })
}

export function loadSuiteState(): Cypress.Chainable<SuiteState> {
  return cy.readFile(SUITE_STATE_PATH) as Cypress.Chainable<SuiteState>
}

export function applicationAppIdFromClientId(
  clientId: string,
  environmentAppId: string
): string {
  const prefix = `${environmentAppId}-`
  expect(clientId.startsWith(prefix), `clientId ${clientId} should start with ${prefix}`).to.eq(
    true
  )
  return clientId.slice(prefix.length)
}

export function issuerEnvDetails() {
  return ['dev', 'test'].map((environment) => ({
    environment,
    issuerUrl: Cypress.env('OIDC_ISSUER'),
    clientRegistration: 'managed',
    clientId: AUTH_PROFILE_CLIENT.clientId,
    clientSecret: AUTH_PROFILE_CLIENT.clientSecret,
  }))
}

export function keyAuthPluginYaml(namespace: string): string {
  return `
  plugins:
  - name: key-auth
    tags: [ ns.${namespace} ]
    protocols: [ http, https ]
    config:
      key_names: ["X-API-KEY"]
      run_on_preflight: true
      hide_credentials: true
      key_in_body: false
`
}

export function keyAuthAclPluginYaml(namespace: string, appId: string): string {
  return `
  plugins:
  - name: key-auth
    tags: [ ns.${namespace} ]
    protocols: [ http, https ]
    config:
      key_names: ["X-API-KEY"]
      run_on_preflight: true
      hide_credentials: true
      key_in_body: false
  - name: acl
    tags: [ ns.${namespace} ]
    config:
      hide_groups_header: true
      allow: [ "${appId}" ]
`
}

export function jwtKeycloakPluginYaml(
  namespace: string,
  issuerUrl: string
): string {
  return `
  plugins:
  - name: jwt-keycloak
    tags: [ ns.${namespace} ]
    enabled: true
    config:
      allowed_iss:
      - ${issuerUrl}
      run_on_preflight: true
      iss_key_grace_period: 10
      maximum_expiration: 0
      algorithm: RS256
      claims_to_verify:
      - exp
      uri_param_names:
      - jwt
      cookie_names: []
      scope: null
      roles: null
      realm_roles: null
      client_roles: null
      anonymous: null
      consumer_match: true
      consumer_match_claim: azp
      consumer_match_claim_custom_id: true
      consumer_match_ignore_not_found: false
`
}

/** Returns a single Kong service document fragment (list item under `services:`). */
export function serviceYamlItem(
  serviceName: string,
  namespace: string,
  pluginYaml: string
): string {
  // pluginYaml already includes a correctly indented `plugins:` block
  return `- name: ${serviceName}
  host: httpbun.com
  tags: [ns.${namespace}]
  port: 443
  protocol: https
  retries: 0
  routes:
  - name: ${serviceName}-route
    tags: [ns.${namespace}]
    hosts:
      - ${serviceName}.api.gov.bc.ca
    paths:
      - /
    methods:
      - GET
    strip_path: false
    https_redirect_status_code: 426
    path_handling: v0
${pluginYaml.trimEnd()}
`
}

export function buildServicesYaml(serviceItems: string[]): string {
  return `services:\n${serviceItems.join('\n')}`
}

/** Set Authorization bearer for subsequent cy.callAPI calls. */
export function useBearerToken(token: string): void {
  cy.setHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  })
  cy.setAuthorizationToken(token)
}

export function getClientCredentialsToken(
  clientId: string,
  clientSecret: string
): Cypress.Chainable<string> {
  return cy
    .request({
      method: 'POST',
      url: Cypress.env('TOKEN_URL'),
      form: true,
      failOnStatusCode: false,
      body: {
        grant_type: 'client_credentials',
        scope: 'openid',
        client_id: clientId,
        client_secret: clientSecret,
      },
    })
    .then((res) => {
      expect(res.status, 'token endpoint status').to.eq(200)
      expect(res.body.access_token, 'access_token').to.be.a('string')
      return res.body.access_token as string
    })
}

export function withIssuerToken(
  creds: SuiteCredentials,
  fn: (token: string) => void
): void {
  getClientCredentialsToken(creds.clientId, creds.clientSecret).then((token) => {
    useBearerToken(token)
    cy.then(() => {
      fn(token)
    })
  })
}

export function issueConsumer(
  gatewayId: string,
  body: Record<string, any>
): Cypress.Chainable<any> {
  cy.setRequestBody(body)
  return cy.callAPI(`ds/api/v3/gateways/${gatewayId}/consumers`, 'POST')
}

export function regenerateConsumer(
  gatewayId: string,
  clientId: string
): Cypress.Chainable<any> {
  cy.setQueryString({ action: 'regenerate' })
  cy.clearRequestBody()
  // callAPI clears queryString after the request
  return cy.callAPI(
    `ds/api/v3/gateways/${gatewayId}/consumers/${encodeURIComponent(clientId)}`,
    'PUT'
  )
}

export function callProtectedApiKey(
  serviceName: string,
  apiKey: string
): Cypress.Chainable<Cypress.Response<any>> {
  return cy.request({
    url: Cypress.env('KONG_URL'),
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      Host: `${serviceName}.api.gov.bc.ca`,
    },
    failOnStatusCode: false,
  })
}

export function callProtectedBearer(
  serviceName: string,
  accessToken: string
): Cypress.Chainable<Cypress.Response<any>> {
  return cy.request({
    url: Cypress.env('KONG_URL'),
    method: 'GET',
    headers: {
      Host: `${serviceName}.api.gov.bc.ca`,
    },
    auth: { bearer: accessToken },
    failOnStatusCode: false,
  })
}

export function getTokenUsingPrivateKey(
  clientId: string,
  tokenEndpoint: string,
  privateKeyPem: string,
  audience?: string
): Cypress.Chainable<string> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const njwt = require('njwt')
  const now = Math.floor(Date.now() / 1000)
  const plus5Minutes = new Date((now + 5 * 60) * 1000)
  const claims = {
    aud: audience || Cypress.env('OIDC_ISSUER'),
  }
  const jwt = njwt
    .create(claims, privateKeyPem, 'RS256')
    .setIssuedAt(now)
    .setExpiration(plus5Minutes)
    .setIssuer(clientId)
    .setSubject(clientId)
    .compact()

  return cy
    .request({
      url: tokenEndpoint,
      method: 'POST',
      form: true,
      failOnStatusCode: false,
      body: {
        grant_type: 'client_credentials',
        client_id: clientId,
        scopes: 'openid',
        client_assertion_type:
          'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: jwt,
      },
    })
    .then((res) => {
      expect(
        res.status,
        `jwt client assertion token: ${JSON.stringify(res.body)}`
      ).to.eq(200)
      return res.body.access_token as string
    })
}

export function configureGwaHost(): void {
  const cleanedUrl = String(Cypress.env('BASE_URL')).replace(/^https?:\/\//i, '')
  const scheme = String(Cypress.env('BASE_URL')).startsWith('https')
    ? 'https'
    : 'http'
  cy.executeCliCommand(
    `gwa config set --host ${cleanedUrl} --scheme ${scheme}`
  ).then((response: any) => {
    expect(response.stdout).to.contain('Config settings saved')
  })
}

export function publishConfigWithToken(
  gatewayId: string,
  token: string,
  relativeFixturePath: string
): void {
  cy.executeCliCommand(`gwa config set --gateway ${gatewayId}`).then(() => {
    cy.executeCliCommand(`gwa config set --token ${token}`).then((setToken) => {
      expect(setToken.stdout || setToken.stderr || '').to.contain(
        'Config settings saved'
      )
      cy.exec(`gwa pg ./cypress/fixtures/${relativeFixturePath}`, {
        timeout: 60000,
        failOnNonZeroExit: false,
      }).then((pub) => {
        const output = `${pub.stdout || ''}\n${pub.stderr || ''}`
        cy.log(output)
        expect(
          output,
          `gwa pg output (code=${pub.code})`
        ).to.match(/Gateway config published|Sync successful/i)
      })
    })
  })
}

export function extractServiceAccountCredsFromUi(): Cypress.Chainable<SuiteCredentials> {
  return cy
    .get('[data-testid=sa-new-creds-client-id]')
    .invoke('val')
    .then((clientId: string) => {
      return cy
        .get('[data-testid=sa-new-creds-client-secret]')
        .invoke('val')
        .then((clientSecret: string) => {
          return { clientId, clientSecret } as SuiteCredentials
        })
    })
}

export function getGatewayServices(gatewayId: string): Cypress.Chainable<any> {
  return cy.callAPI(`ds/api/v3/gateways/${gatewayId}/services`, 'GET')
}

/**
 * Poll until Keystone has ingested the published Kong services for this gateway.
 * Optionally nudges the feeder to sync the namespace first.
 */
export function waitForGatewayServices(
  gatewayId: string,
  expectedServiceNames: string[],
  attempts = 20
): void {
  // Best-effort: ask feeder to pull Kong entities for this namespace
  cy.request({
    method: 'PUT',
    url: `http://feeder.localtest.me:6000/forceSync/kong/namespace/${gatewayId}`,
    failOnStatusCode: false,
  })

  const tryOnce = (remaining: number) => {
    getGatewayServices(gatewayId).then(({ apiRes }: any) => {
      const names = new Set<string>()
      ;(apiRes.body || []).forEach((r: any) => {
        if (r?.name) names.add(r.name)
        if (r?.service?.name) names.add(r.service.name)
        if (typeof r?.service === 'string') names.add(r.service)
      })
      const present = Array.from(names)
      const missing = expectedServiceNames.filter((n) => !names.has(n))
      if (missing.length === 0) {
        cy.log(`All ${expectedServiceNames.length} services synced`)
        return
      }
      if (remaining <= 1) {
        throw new Error(
          `Timed out waiting for gateway services. Missing: ${missing.join(
            ', '
          )}. Present: ${present.join(', ')}`
        )
      }
      cy.wait(3000)
      tryOnce(remaining - 1)
    })
  }
  tryOnce(attempts)
}

export function putProduct(
  gatewayId: string,
  product: Record<string, any>
): Cypress.Chainable<any> {
  cy.setRequestBody(product)
  return cy.callAPI(`ds/api/v3/gateways/${gatewayId}/products`, 'PUT')
}

export function getProducts(gatewayId: string): Cypress.Chainable<any> {
  return cy.callAPI(`ds/api/v3/gateways/${gatewayId}/products`, 'GET')
}

export function putIssuer(
  gatewayId: string,
  issuer: Record<string, any>
): Cypress.Chainable<any> {
  cy.setRequestBody(issuer)
  return cy.callAPI(`ds/api/v3/gateways/${gatewayId}/issuers`, 'PUT')
}
