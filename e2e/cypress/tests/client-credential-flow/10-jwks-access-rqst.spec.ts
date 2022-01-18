import LoginPage from '../../pageObjects/login'
import ApplicationPage from '../../pageObjects/applications'
import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import MyAccessPage from '../../pageObjects/myAccess'


describe('Developer creates an access request', () => {

  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()  
  const app = new ApplicationPage()
  const ma = new MyAccessPage()

  before(() => {
    cy.visit('/')
    cy.clearCookies()
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
    cy.get('@developer').then(({ jwksApplication }: any) => {
      app.createApplication(jwksApplication)
    })
  })

  it('Creates an access request', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ jwksProduct, jwksApplication, accessRequest }: any) => {
      apiDir.createAccessRequest(jwksProduct, jwksApplication, accessRequest)
      ma.clickOnGenerateSecretButton()
      
      cy.contains("Client ID").should('be.visible');
      cy.contains("Signing Private Key").should('be.visible');
      cy.contains("Signing Public Certificate").should('be.visible');
      cy.contains("Token Endpoint").should('be.visible');

      ma.saveJwksCredentials();
    })
  })

  after(() => {
    cy.logout()
  })
})
