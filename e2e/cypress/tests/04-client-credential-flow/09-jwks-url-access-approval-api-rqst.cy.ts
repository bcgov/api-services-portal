import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import ConsumersPage from '../../pageObjects/consumers'

const njwt = require('njwt')
const jose = require('node-jose')

describe('Access manager approves developer access request for JWKS URL flow', () => {
  const home = new HomePage()
  const login = new LoginPage()
  const consumers = new ConsumersPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    // cy.visit(login.path)
  })

  it('Access Manager logs in', () => {
    cy.get('@access-manager').then(({ user, clientCredentials }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      home.useNamespace(clientCredentials.namespace)
    })
  })

  it('Access Manager approves developer access request', () => {
    cy.get('@access-manager').then(() => {
      cy.visit(consumers.path)
      consumers.reviewThePendingRequest()
    })
  })

  it('approves an access request', () => {
    consumers.approvePendingRequest()
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Make an API request using JWKS URL flow with JWT signed with generated private key', () => {
  it('Get access token using JWT key pair; make API request', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {
      let jwkCred = JSON.parse(store_res.jwksurlcredentials)
      let ks = store_res.jwksurlkeys

      cy.log(ks)

      let tokenEndpoint = jwkCred.tokenEndpoint
      let issuer = jwkCred.issuer

      jose.JWK.asKeyStore(ks).then((keyStore: { all: (arg0: { use: string }) => [any] }) => {
        cy.log(keyStore.toString())
        const [key] = keyStore.all({ use: 'sig' })

        const privateKey = key.toPEM(true)
        let clientId = jwkCred.clientId
        let now = Math.floor(new Date().getTime() / 1000)
        const plus5Minutes = new Date((now + 5 * 60) * 1000)
        const alg = 'RS256'

        let claims = {
          aud: issuer,
        }

        let jwt = njwt
          .create(claims, privateKey, alg)
          .setIssuedAt(now)
          .setExpiration(plus5Minutes)
          .setIssuer(clientId)
          .setSubject(clientId)
          .compact()

        cy.request({
          url: tokenEndpoint,
          method: 'POST',
          body: {
            grant_type: 'client_credentials',
            client_id: clientId,
            scopes: 'openid',
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: jwt,
          },
          form: true,
        }).then((res) => {
          let token = res.body.access_token
          cy.request({
            url: Cypress.env('KONG_URL'),
            headers: {
              Host: 'cc-service-for-platform.api.gov.bc.ca',
            },
            auth: {
              bearer: token,
            },
          }).then((res) => {
            expect(res.status).to.eq(200)
          })
        })
      })
    })
  })
})
