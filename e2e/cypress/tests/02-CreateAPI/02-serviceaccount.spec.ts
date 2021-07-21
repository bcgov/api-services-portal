import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'
import ToolBar from '../../pageObjects/toolbar'

describe('Service Account spec', () => {
  const home = new HomePage()
  const sa = new ServiceAccountsPage()
  const tb = new ToolBar()
  const login = new LoginPage()

  beforeEach(() => {
    cy.fixture('apiowner').as('apiowner')
    cy.visit(login.path)
    cy.preserveCookies()
  })
  it('find login button', () => {
    cy.xpath(login.loginButton).should('be.visible')
  })

  it('user authentication', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('should allow user to create a new service account', () => {
    cy.get('@apiowner').then(({ namespace }: any) => {
      home.useNamespace(namespace)
    })
    cy.xpath(tb.namespaces).click()
    cy.contains('Service Accounts').click({ force: true })
    cy.xpath(sa.newServiceAccount).click()
    cy.get('@apiowner').then(({ serviceAccount }: any) => {
      cy.log(serviceAccount.scopes)
      sa.createServiceAccount(serviceAccount.scopes)
    })
    sa.saveServiceAcctCreds()
  })
  after(() => {
    cy.logout()
  })
})
