import HomePage from '../pageObjects/home'
import LoginPage from '../pageObjects/login'
import ServiceAccountsPage from '../pageObjects/serviceAccounts'
import ToolBar from '../pageObjects/toolbar'

describe('Create API Spec', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const tb = new ToolBar()
  const sa = new ServiceAccountsPage()

  beforeEach(() => {
    cy.fixture('apiowner').as('apiowner')
    cy.visit(login.path)
  })

  it('authenticates api owner', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('creates and activates new namespace', () => {
    cy.get('@apiowner').then(({ namespace }: any) => {
      home.createNamespace(namespace)
      home.useNamespace(namespace)
    })
  })
  it('creates a new service account', () => {
    cy.xpath(tb.namespaces).click()
    cy.contains('Service Accounts').click({ force: true })
    cy.get('@apiowner').then(({ serviceAccount }: any) => {
      cy.log(serviceAccount.scopes)
      sa.createServiceAccount(serviceAccount.scopes)
    })
    sa.saveServiceAcctCreds()
  })
  afterEach(() => {
    cy.preserveCookies()
  })
  after(() => {
    cy.logout()
  })
})
