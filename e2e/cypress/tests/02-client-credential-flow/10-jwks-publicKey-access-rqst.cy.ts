import LoginPage from '../../pageObjects/login'
import ApplicationPage from '../../pageObjects/applications'
import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import MyAccessPage from '../../pageObjects/myAccess'

const jose = require('node-jose')

describe('Generates public/private key and set public key to access request', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const ma = new MyAccessPage()

  before(() => {
    cy.visit('/')
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    // cy.visit(login.path)
  })

  it('Generate the RS256 key pair', () => {
    cy.generateKeyPair()
  })

  it('Developer logs in', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Creates an application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ clientCredentials }: any) => {
      app.createApplication(clientCredentials.jwksPublicKey.application)
    })
  })

  it('Enter JWT key with invalid format', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ clientCredentials, accessRequest }: any) => {
      let jwksPublicKey = clientCredentials.jwksPublicKey
      apiDir.enterInvalidJWTKey(jwksPublicKey.product, jwksPublicKey.application, accessRequest)
    })
  })

  it('Verify the error popups for invalid JWT key', () => {
    cy.wait(3000)
    cy.verifyToastMessage("Certificate failed validation")
  })

  it('Creates an access request', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ clientCredentials, accessRequest }: any) => {
      let jwksPublicKey = clientCredentials.jwksPublicKey

      apiDir.createAccessRequest(jwksPublicKey.product, jwksPublicKey.application, accessRequest)
      ma.clickOnGenerateSecretButton()

      cy.contains('Client ID').should('be.visible')
      cy.contains('Issuer').should('be.visible')
      cy.contains('Token Endpoint').should('be.visible')

      ma.saveJwksUrlCredentials()
    })
  })

  after(() => {
    cy.logout()
  })
})