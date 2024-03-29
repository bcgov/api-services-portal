import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'

describe('Request Access Spec', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const myAccessPage = new MyAccessPage()

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

  it('authenticates Harley (developer)', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('creates an application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ applicationLabels }: any) => {
      app.createApplication(applicationLabels)
    })
  })

  it('creates an access request', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ product, applicationLabels,accessRequest }: any) => {
      apiDir.createAccessRequest(product, applicationLabels, accessRequest)
      myAccessPage.clickOnGenerateSecretButton()
      cy.contains("API Key").should('be.visible')
      myAccessPage.saveAPIKeyValue()
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
