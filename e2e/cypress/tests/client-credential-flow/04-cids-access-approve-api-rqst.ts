import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import ConsumersPage from '../../pageObjects/consumers'

describe('Access manager approves developer access request for Client ID/Secret flow', () => {

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
    cy.visit(login.path)
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
      cy.contains('Review').click()
      cy.contains('Approve').click()
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})


describe('Make an API request using client ID, secret, and access token', () => {

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