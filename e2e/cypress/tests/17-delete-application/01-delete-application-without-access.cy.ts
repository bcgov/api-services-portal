import ApplicationPage from '../../pageObjects/applications'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import Products from '../../pageObjects/products'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'

describe('Delete application which has no access request spec', () => {
  const login = new LoginPage()
  const app = new ApplicationPage()


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
      app.createApplication(deleteApplication.application)
    })
  })

  it('Delete application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ deleteApplication }: any) => {
      app.deleteApplication(deleteApplication.application.name)
    })
  })

  it('Verify that application is deleted', () => {
    cy.get('@developer').then(({ deleteApplication }: any) => {
      cy.verifyToastMessage("Application delete")
      app.checkDeletedApplication(deleteApplication.application.name)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
