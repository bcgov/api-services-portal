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
    cy.preserveCookies()
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
    })
  })
  it('creates a new service account', () => {
    cy.visit(sa.path)
    cy.get('@apiowner').then(({ serviceAccount }: any) => {
      sa.createServiceAccount(serviceAccount.scopes)
    })
    sa.saveServiceAcctCreds()
  })

  it('publishes a new API to Kong Gateway', () => {
    cy.publishApi('service.yml').then(() => {
      cy.get('@publishAPIResponse').then((res: any) => {
        cy.log(JSON.stringify(res.body))
      })
    })
  })
  after(() => {
    cy.logout()
  })
})
