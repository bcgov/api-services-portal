import HomePage from '../../pageObjects/home'
import NamespacesPage from '../../pageObjects/namespaces'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'
import ToolBar from '../../pageObjects/toolbar'

describe('Service Account spec', () => {
  const home = new HomePage()
  const nss = new NamespacesPage()
  const sa = new ServiceAccountsPage()
  const tb = new ToolBar()
  before(() => {
    cy.visit('/')
    cy.fixture('api-owner').as('api-owner')
    cy.get('@api-owner').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      home.useNamespace(namespace)
    })
    cy.xpath(tb.namespaces).click()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('api-owner').as('api-owner')
  })

  it('should service accounts tab', () => {
    cy.xpath(nss.serviceAccount).should('include.text', 'Service Accounts')
  })

  it('should allow user to create a new service account', () => {
    cy.xpath(nss.serviceAccount).click({ force: true })
    cy.xpath(sa.newServiceAccount).click()
    cy.get('@api-owner').then(({ serviceAccount }: any) => {
      cy.log(serviceAccount.scopes)
      sa.createServiceAccount(serviceAccount.scopes)
    })
  })

  it('should verify if client id and secret are generated', () => {
    cy.xpath(sa.clientId).should('be.visible')
    cy.xpath(sa.clientSecret).should('be.visible')
    sa.saveServiceAcctCreds()
  })
  after(() => {
    cy.logout()
  })
})
