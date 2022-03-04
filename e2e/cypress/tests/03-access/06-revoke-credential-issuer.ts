import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import NameSpacePage from '../../pageObjects/namespace'
import MyProfilePage from '../../pageObjects/myProfile'
import ToolBar from '../../pageObjects/toolbar'
import AuthorizationProfile from '../../pageObjects/authProfile'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'

describe('Revoke Credential Issuer Role', () => {
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

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user, checkPermission }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
      home.useNamespace(checkPermission.namespace)
    })
  })

  it('revoke "CredentialIssuer.Admin" access and only assign "Namespace.Manage" permission to Wendy', () => {
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission(checkPermission.grantPermission.Wendy)
      na.revokePermission(checkPermission.revokePermission.Wendy_ci)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Verify that Wendy is unable to create authorization profile', () => {

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

  it('authenticates Wendy (Credential-Issuer)', () => {
    cy.get('@credential-issuer').then(({ user, checkPermission }: any) => {
      cy.visit(login.path)
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
      home.useNamespace(checkPermission.namespace)
      cy.visit(mp.path)
    })
  })

  it('Verify that only "Namespace.Manage" permission is displayed in the profile', () => {
    mp.checkScopeOfProfile("Namespace.Manage")
  })

  it('Verify that authorization profile for Client ID/Secret is not generated', () => {
    cy.visit(authProfile.path)
    cy.get('@credential-issuer').then(({ clientCredentials }: any) => {
      let ap = clientCredentials.authProfile
      authProfile.createAuthProfile(ap,false)
    })
  })

  it('Verify that authorization profile for Kong API key is not generated', () => {
    cy.visit(authProfile.path)
    cy.get('@credential-issuer').then(({ kongAPI }: any) => {
      let ap = kongAPI.authProfile
      authProfile.createAuthProfile(ap,false)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})