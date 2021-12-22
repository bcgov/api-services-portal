import LoginPage from '../../pageObjects/login'

describe('Make an API request using client ID, secret, and access token', () => {
  const login = new LoginPage()

  before(() => {
    cy.visit('/')
    cy.clearCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.visit(login.path)
  })

  it('Get access token using client ID and secret; make API request', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {
      let cc = JSON.parse(store_res.clientCredentials)
      cy.getAccessToken(cc.clientId, cc.clientSecret).then(() => {
        cy.get('@accessTokenResponse').then((token_res: any) => {
          let token = token_res.body.access_token
          cy.request({
            url: Cypress.env('KONG_URL'),
            headers: {
              Host: 'a-service-for-platform.api.gov.bc.ca',
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
