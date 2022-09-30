import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import NameSpacePage from '../../pageObjects/namespace'
import MyProfilePage from '../../pageObjects/myProfile'
import ToolBar from '../../pageObjects/toolbar'
import AuthorizationProfile from '../../pageObjects/authProfile'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'

describe('Grant Namespace Manage Role', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()

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

  it('Authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user, checkPermission }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
      home.useNamespace(checkPermission.namespace)
    })
  })

  it('Grant only "Namespace.Manage" permission to Wendy', () => {
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      cy.visit(na.path)
      na.revokeAllPermission('wendy')
      // na.revokePermission(checkPermission.revokePermission.Wendy_ci)
      na.clickGrantUserAccessButton()
      na.grantPermission(checkPermission.grantPermission.Wendy)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Verify that Wendy is able to see all the options for the Namespace', () => {

  const login = new LoginPage()
  const home = new HomePage()
  const ns = new NameSpacePage()
  const mp = new MyProfilePage()
  const tb = new ToolBar()
  const authProfile = new AuthorizationProfile()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('credential-issuer').as('credential-issuer')
    cy.fixture('apiowner').as('apiowner')
  })

  it('Authenticates Wendy (Credential-Issuer)', () => {
    cy.get('@credential-issuer').then(({ user, checkPermission }: any) => {
      cy.visit(login.path)
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
      home.useNamespace(checkPermission.namespace)
      cy.visit(mp.path)
    })
  })

  it('Verify that all the namespace options and activities are displayed', () => {
    cy.visit(ns.path)
    ns.verifyThatAllOptionsAreDisplayed()
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
    cy.resetCredential('Wendy')
  })
})
