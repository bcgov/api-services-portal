import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
import NameSpacePage from '../../pageObjects/namespace'
import ToolBar from '../../pageObjects/toolbar'
import AuthorizationProfile from '../../pageObjects/authProfile'

describe('Grant Credential Issuer Role', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()

  before(() => {
    cy.visit('/')
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('Authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ checkPermission }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        cy.log('Logged in!')
        cy.activateGateway(checkPermission.namespace)
      })
    })
  })

  it('Grant only "CredentialIssuer.Admin" access to Wendy (access manager)', () => {
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      cy.visit(na.path)
      na.revokeAllPermission(checkPermission.grantPermission.Wendy.userName)
      na.clickGrantUserAccessButton()
      na.grantPermission(checkPermission.grantPermission.Wendy_CA)
      // na.revokePermission(checkPermission.revokePermission.Wendy)
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
  const tb = new ToolBar()
  const authProfile = new AuthorizationProfile()

  before(() => {
    cy.visit('/')
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('credential-issuer').as('credential-issuer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
  })

  it('Authenticates Wendy (Credential-Issuer)', () => {
    cy.get('@credential-issuer').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ checkPermission }: any) => {
        cy.visit(login.path)
        cy.login(user.credentials.username, user.credentials.password)
        cy.log('Logged in!')
        cy.activateGateway(checkPermission.namespace)
      })
    })
  })

  it('Verify that only Authorization Profile option is displayed in Namespace page', () => {
    cy.visit(ns.detailPath)
    ns.verifyThatOnlyAuthorizationProfileLinkIsExist()
  })

  it('Verify that authorization profile for Client ID/Secret is generated', () => {
    cy.visit(authProfile.path)
    cy.get('@credential-issuer').then(({ clientCredentials }: any) => {
      let ap = clientCredentials.authProfile
      authProfile.createAuthProfile(ap)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
    // cy.resetCredential('Wendy')
  })
})