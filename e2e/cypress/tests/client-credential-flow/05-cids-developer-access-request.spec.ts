import LoginPage from '../../pageObjects/login'
import ApplicationPage from '../../pageObjects/applications'
import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import MyAccessPage from '../../pageObjects/myAccess'

<<<<<<< HEAD:e2e/cypress/tests/client-credential-flow/03-cids-access-rqst.ts
describe('Developer creates an access request for Client ID/Secret flow', () => {
=======
describe('Developer creates an access request for Client ID/Secret', () => {
>>>>>>> 5b71799c (Finishes JWKS URL test suite):e2e/cypress/tests/client-credential-flow/05-cids-developer-access-request.spec.ts
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const ma = new MyAccessPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    cy.visit(login.path)
  })

  it('Developer logs in', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Creates an application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ clientCredentials }: any) => {
      app.createApplication(clientCredentials.clientIdSecret.application)
    })
  })

  it('Creates an access request', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ clientCredentials, accessRequest }: any) => {
      let product = clientCredentials.clientIdSecret.product
      let app = clientCredentials.clientIdSecret.application
<<<<<<< HEAD:e2e/cypress/tests/client-credential-flow/03-cids-access-rqst.ts
<<<<<<< HEAD:e2e/cypress/tests/client-credential-flow/03-cids-access-rqst.ts

=======
      
>>>>>>> 39f3e81f (Clean up and finishes JWT generated key pair test suite; start JWKS url test suite):e2e/cypress/tests/client-credential-flow/06-developer-access-request.spec.ts
=======

>>>>>>> 5b71799c (Finishes JWKS URL test suite):e2e/cypress/tests/client-credential-flow/05-cids-developer-access-request.spec.ts
      apiDir.createAccessRequest(product, app, accessRequest)
      ma.clickOnGenerateSecretButton()

      cy.contains('Client ID').should('be.visible')
      cy.contains('Client Secret').should('be.visible')
      cy.contains('Token Endpoint').should('be.visible')

      ma.saveClientCredentials()
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
 