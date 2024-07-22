import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import ConsumersPage from '../../pageObjects/consumers'
import KeycloakUserGroupPage from '../../pageObjects/keycloakUserGroup'
import keycloakGroupPage from '../../pageObjects/keycloakGroup'
import AuthorizationProfile from '../../pageObjects/authProfile'
import keycloakClientScopesPage from '../../pageObjects/keycloakClientScopes'

describe('Access manager approves developer access request for Client ID/Secret authenticator', () => {
  const home = new HomePage()
  const login = new LoginPage()
  const consumers = new ConsumersPage()

  before(() => {
    cy.visit('/')
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    // cy.visit(login.path)
  })

  it('Access Manager logs in', () => {
    cy.get('@access-manager').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ clientCredentials }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        cy.activateGateway(clientCredentials.namespace)
      })
    })
  })

  it('Access Manager approves developer access request', () => {
    cy.visit(consumers.path)
    consumers.reviewThePendingRequest()
  })

  it('Select scopes in Authorization Tab', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      consumers.selectAuthorizationScope(clientCredentials.clientIdSecret.authProfile.scopes)
    })
  })

  it('approves an access request', () => {
    consumers.approvePendingRequest()
  })

  after(() => {
    cy.logout()
  })
})

describe('Make an API request using Client ID, Secret, and Access Token', () => {
  it('Get access token using client ID and secret; make API request', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {

      let cc = JSON.parse(store_res.clientidsecret)

      cy.getAccessToken(cc.clientId, cc.clientSecret).then(() => {
        cy.get('@accessTokenResponse').then((token_res: any) => {
          let token = token_res.body.access_token
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