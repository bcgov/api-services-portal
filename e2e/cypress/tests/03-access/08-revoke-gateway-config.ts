import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import MyProfilePage from '../../pageObjects/myProfile'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
import ConsumersPage from '../../pageObjects/consumers'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'


describe('Verify that Kong does not publish API if the Service Account does not have "GatewayConfig.Publish" permission', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()
  const sa = new ServiceAccountsPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user, checkPermission }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      home.useNamespace(checkPermission.namespace)
    })
  })

  it('creates a new service account with out "GatewayConfig.Publish" permission" ', () => {
    cy.visit(sa.path)
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      sa.createServiceAccount(checkPermission.revokePermission.serviceAccount.scopes)
    })
    sa.saveServiceAcctCreds()
  })

  it('Verify that GWA API does not let user to publish the API to Kong gateway', () => {
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      cy.publishApi('service-permission.yml', checkPermission.namespace).then(() => {
        cy.get('@publishAPIResponse').then((res: any) => {
          debugger
          expect(JSON.stringify(res.body.error)).to.be.contain('Not authorized to access namespace permission with GatewayConfig.Publish')
          expect(res.statusCode).to.be.equal(403)
        })
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})