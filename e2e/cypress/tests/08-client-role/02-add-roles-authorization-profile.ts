import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
import AuthorizationProfile from '../../pageObjects/authProfile'


describe('Apply client roles to the Authorization Profile', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()
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
    cy.fixture('common-testdata').as('common-testdata')
  })

  it('Authenticates Wendy (Credential-Issuer)', () => {
    cy.get('@credential-issuer').then(({ user }: any) => {
      cy.visit(login.path)
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
    })
  })

  it('Select the namespace created for client credential ', () => {
    cy.get('@common-testdata').then(({ clientCredentials }: any) => {
      home.useNamespace(clientCredentials.namespace)
    })
  })

  it('Clear the Client Scope', () => {
    cy.visit(authProfile.path)
    cy.get('@credential-issuer').then(({ clientIdSecret }: any) => {
      let ap = clientIdSecret.authProfile.name
      authProfile.editAuthorizationProfile(ap)
      authProfile.clearClientScope()
    })
  })

  it('Set the roles to the authorization profile', () => {
    cy.visit(authProfile.path)
    cy.get('@credential-issuer').then(({ clientIdSecret }: any) => {
      authProfile.editAuthorizationProfile(clientIdSecret.authProfile.name)
      authProfile.setClientRoles(clientIdSecret.authProfile.roles)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})