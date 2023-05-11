import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'

describe('Collect credential Spec', () => {
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
  })

  it('authenticates Harley (developer)', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Navigate to my Access Page', () => {
    cy.visit(myAccessPage.path)
  })

  it('Verify that the request status is Pending Approval', () => {
    cy.get('@developer').then(({ product, application }: any) => {
      myAccessPage.checkRequestStatus(product.environment, application.name, 'Pending Approval')
    })
  })

  it('Collect the credentials', () => {
      myAccessPage.clickOnCollectCredentialButton()
      myAccessPage.clickOnGenerateSecretButton()
      cy.contains("API Key").should('be.visible')
      myAccessPage.saveClientIDValue()
      myAccessPage.saveAPIKeyValue()
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
