import LoginPage from '../../pageObjects/login'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'
import {
  FLOW_KEYS,
  FlowConfig,
  SuiteState,
  SUITE_FIXTURE_DIR,
  buildServicesYaml,
  configureGwaHost,
  extractServiceAccountCredsFromUi,
  getProducts,
  issuerEnvDetails,
  jwtKeycloakPluginYaml,
  keyAuthAclPluginYaml,
  keyAuthPluginYaml,
  publishConfigWithToken,
  putIssuer,
  putProduct,
  saveSuiteState,
  serviceYamlItem,
  useBearerToken,
} from './helpers'

const { v4: uuidv4 } = require('uuid')

/**
 * Independent bootstrap for self-issuing credentials.
 * Creates gateway, service accounts, issuers, products/envs, Kong services/plugins.
 * Writes suite state to fixtures/state/24-self-issue.json.
 */
describe('24 Self-issuing credentials — setup', () => {
  const login = new LoginPage()
  const sa = new ServiceAccountsPage()

  let gatewayId = ''
  let displayName = ''
  let publishSa: { clientId: string; clientSecret: string }
  let issuerSa: { clientId: string; clientSecret: string }
  let controlSa: { clientId: string; clientSecret: string }
  let ownerToken = ''

  const suffix = uuidv4().replace(/-/g, '').substring(0, 6).toLowerCase()

  const closeSaCredsDialog = () => {
    cy.contains('button', 'Close').click({ force: true })
  }

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
  })

  it('logs in as Janis (API owner)', () => {
    cy.visit(login.path)
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('creates and activates a dedicated gateway', () => {
    cy.createGateway().then((gw: any) => {
      gatewayId = gw.gatewayId
      displayName = gw.displayName
      cy.activateGateway(gatewayId)
    })
  })

  it('captures owner session token for v3 management APIs', () => {
    cy.getUserSession().then(() => {
      cy.get('@login').then((xhr: any) => {
        ownerToken = xhr.headers['x-auth-request-access-token']
        expect(ownerToken, 'owner session token').to.be.a('string')
        useBearerToken(ownerToken)
      })
    })
  })

  it('creates a publish service account', () => {
    cy.visit(sa.path)
    sa.createServiceAccount(['GatewayConfig.Publish'])
    extractServiceAccountCredsFromUi().then((creds) => {
      publishSa = creds
      closeSaCredsDialog()
    })
  })

  it('creates an issuer service account with CredentialIssuer.Generate', () => {
    cy.visit(sa.path)
    sa.createServiceAccount(['CredentialIssuer.Generate'])
    extractServiceAccountCredsFromUi().then((creds) => {
      issuerSa = creds
      closeSaCredsDialog()
    })
  })

  it('creates a control service account without CredentialIssuer.Generate', () => {
    cy.visit(sa.path)
    sa.createServiceAccount(['GatewayConfig.Publish'])
    extractServiceAccountCredsFromUi().then((creds) => {
      controlSa = creds
      closeSaCredsDialog()
    })
  })

  it('creates authorization profiles for client-credentials flows', () => {
    useBearerToken(ownerToken)

    const issuers = [
      {
        name: `sic-secret-${suffix}`,
        clientAuthenticator: 'client-secret',
      },
      {
        name: `sic-jwt-${suffix}`,
        clientAuthenticator: 'client-jwt',
      },
      {
        name: `sic-jwks-${suffix}`,
        clientAuthenticator: 'client-jwt-jwks-url',
      },
    ]

    issuers.forEach((issuer) => {
      putIssuer(gatewayId, {
        name: issuer.name,
        description: `Self-issuing ${issuer.clientAuthenticator}`,
        flow: 'client-credentials',
        clientAuthenticator: issuer.clientAuthenticator,
        mode: 'auto',
        environmentDetails: issuerEnvDetails(),
      }).then(({ apiRes }: any) => {
        expect(apiRes.status, `issuer ${issuer.name}`).to.be.oneOf([200, 201])
      })
    })
  })

  it('creates products with inactive environments to capture environmentAppIds', () => {
    useBearerToken(ownerToken)

    const productDefs = [
      {
        key: FLOW_KEYS.apiKeyOnly,
        name: `SIC API Key Only ${suffix}`,
        flow: 'kong-api-key-only' as const,
      },
      {
        key: FLOW_KEYS.apiKeyAcl,
        name: `SIC API Key ACL ${suffix}`,
        flow: 'kong-api-key-acl' as const,
      },
      {
        key: FLOW_KEYS.clientSecret,
        name: `SIC CC Secret ${suffix}`,
        flow: 'client-credentials' as const,
        issuerName: `sic-secret-${suffix}`,
        authenticator: 'client-secret' as const,
      },
      {
        key: FLOW_KEYS.clientJwt,
        name: `SIC CC JWT ${suffix}`,
        flow: 'client-credentials' as const,
        issuerName: `sic-jwt-${suffix}`,
        authenticator: 'client-jwt' as const,
      },
      {
        key: FLOW_KEYS.clientJwks,
        name: `SIC CC JWKS ${suffix}`,
        flow: 'client-credentials' as const,
        issuerName: `sic-jwks-${suffix}`,
        authenticator: 'client-jwt-jwks-url' as const,
      },
    ]

    productDefs.forEach((def) => {
      const environments = ['dev', 'test'].map((name) => {
        const env: any = {
          name,
          active: false,
          approval: false,
          flow: def.flow,
        }
        if (def.issuerName) {
          env.credentialIssuer = def.issuerName
        }
        return env
      })

      putProduct(gatewayId, {
        name: def.name,
        environments,
      }).then(({ apiRes }: any) => {
        expect(apiRes.status, `product ${def.name}`).to.eq(200)
      })
    })

    Cypress.env('sicProductDefs', productDefs)
  })

  it('publishes Kong services/plugins and saves suite state', () => {
    useBearerToken(ownerToken)
    configureGwaHost()

    const productDefs = Cypress.env('sicProductDefs') as any[]
    const flows: Record<string, FlowConfig> = {}

    getProducts(gatewayId).then(({ apiRes }: any) => {
      expect(apiRes.status).to.eq(200)
      const products = apiRes.body as any[]

      const serviceItems: string[] = []

      productDefs.forEach((def) => {
        const product = products.find((p) => p.name === def.name)
        expect(product, `product ${def.name} exists`).to.exist

        const envs = ['dev', 'test'].map((envName) => {
          const env = product.environments.find((e: any) => e.name === envName)
          expect(env?.appId, `${def.name}/${envName} appId`).to.be.a('string')
          const serviceName = `sic-${def.key}-${envName}-${suffix}`.toLowerCase()
          return {
            name: envName as 'dev' | 'test',
            environmentAppId: env.appId as string,
            serviceName,
            host: `${serviceName}.api.gov.bc.ca`,
          }
        })

        envs.forEach((env) => {
          let pluginYaml = ''
          if (def.flow === 'kong-api-key-only') {
            pluginYaml = keyAuthPluginYaml(gatewayId)
          } else if (def.flow === 'kong-api-key-acl') {
            pluginYaml = keyAuthAclPluginYaml(gatewayId, env.environmentAppId)
          } else {
            pluginYaml = jwtKeycloakPluginYaml(
              gatewayId,
              Cypress.env('OIDC_ISSUER')
            )
          }
          serviceItems.push(
            serviceYamlItem(env.serviceName, gatewayId, pluginYaml)
          )
        })

        flows[def.key] = {
          key: def.key,
          productName: def.name,
          flow: def.flow,
          authenticator: def.authenticator,
          issuerName: def.issuerName,
          envs,
        }
      })

      const fixturePath = `${SUITE_FIXTURE_DIR}/gateway-services-${suffix}.yml`
      cy.writeFile(
        `cypress/fixtures/${fixturePath}`,
        buildServicesYaml(serviceItems)
      ).then(() => {
        cy.request({
          method: 'POST',
          url: Cypress.env('TOKEN_URL'),
          form: true,
          body: {
            grant_type: 'client_credentials',
            scope: 'openid',
            client_id: publishSa.clientId,
            client_secret: publishSa.clientSecret,
          },
        }).then((tokenRes) => {
          expect(tokenRes.status).to.eq(200)
          publishConfigWithToken(
            gatewayId,
            tokenRes.body.access_token,
            fixturePath
          )

          // Issuance does not require portal env activation or service linkage;
          // Kong plugins published above are enough for upstream checks.
          const suiteState: SuiteState = {
            gatewayId,
            displayName,
            issuerSa,
            controlSa,
            publishSa,
            flows,
          }
          saveSuiteState(suiteState)
        })
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
