import ApiDirectoryPage from '../pageObjects/apiDirectory'
import ApplicationPage from '../pageObjects/applications'
import LoginPage from '../pageObjects/login'

describe('Request Access Spec', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()

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

  it('authenticates developer', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('creates an application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ application }: any) => {
      app.createApplication(application)
    })
  })

  it('creates an access request', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ product, application, accessRequest }: any) => {
      apiDir.createAccessRequest(product, application, accessRequest)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({log:true})
    cy.deleteAllCookies()
  })
})
