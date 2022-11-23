import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'

describe('Delete application which has pending request spec', () => {
  const login = new LoginPage()
  const app = new ApplicationPage()
  const apiDir = new ApiDirectoryPage()
  const myAccessPage = new MyAccessPage()


  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
  })

  it('authenticates Harley (developer)', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('creates an application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ deleteApplication }: any) => {
      app.createApplication(deleteApplication.pendingRequest)
    })
  })

  it('creates an access request', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ product, deleteApplication,accessRequest }: any) => {
      apiDir.createAccessRequest(product, deleteApplication.pendingRequest, accessRequest)
      myAccessPage.clickOnGenerateSecretButton()
      cy.contains("API Key").should('be.visible')
    })
  })

  it('Delete application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ deleteApplication }: any) => {
      app.deleteApplication(deleteApplication.pendingRequest.name)
    })
  })

  it('Verify that application is deleted', () => {
    cy.get('@developer').then(({ deleteApplication }: any) => {
      cy.verifyToastMessage("Application delete")
      app.checkDeletedApplication(deleteApplication.pendingRequest.name)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
