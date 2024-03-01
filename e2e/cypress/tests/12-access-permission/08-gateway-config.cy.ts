import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import MyProfilePage from '../../pageObjects/myProfile'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'
import AuthorizationProfile from '../../pageObjects/authProfile'
import ToolBar from '../../pageObjects/toolbar'
import NameSpacePage from '../../pageObjects/namespace'


describe('Grant Gateway Config Role to Wendy', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()
  const sa = new ServiceAccountsPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ checkPermission }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        home.useNamespace(checkPermission.namespace)
      })
    })
  })

  it('Grant "GatewayConfig.Publish" and "Namespace.View" access to Wendy (access manager)', () => {
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      cy.visit(na.path)
      // na.revokePermission(checkPermission.grantPermission.Wendy)
      na.revokeAllPermission(checkPermission.grantPermission.Wendy.userName)
      na.clickGrantUserAccessButton()
      na.grantPermission(checkPermission.grantPermission.Wendy_GC)
    })
  })

  after(() => {
    cy.logout()
  })
})

describe('Verify that Wendy is able to generate authorization profile', () => {

  const login = new LoginPage()
  const home = new HomePage()
  const ns = new NameSpacePage()
  const mp = new MyProfilePage()
  const tb = new ToolBar()
  const authProfile = new AuthorizationProfile()

  before(() => {
    cy.visit('/')
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('credential-issuer').as('credential-issuer')
    cy.fixture('common-testdata').as('common-testdata')
    cy.fixture('apiowner').as('apiowner')
  })

  it('Authenticates Wendy (Credential-Issuer)', () => {
    cy.get('@credential-issuer').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ checkPermission }: any) => {
        cy.visit(login.path)
        cy.login(user.credentials.username, user.credentials.password)
        cy.log('Logged in!')
        home.useNamespace(checkPermission.namespace)
        cy.visit(mp.path)
      })
    })
  })

  it('Verify that GWA API allows user to publish the API to Kong gateway', () => {
    cy.get('@common-testdata').then(({ checkPermission }: any) => {
      cy.publishApi('service-permission.yml', checkPermission.namespace).then((response: any) => {
        expect(response.stdout).to.contain('Sync successful');
      })
    })
  })

  after(() => {
    cy.logout()
    cy.resetCredential('Wendy')
    cy.logout()
  })
})