import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
import AuthorizationProfile from '../../pageObjects/authProfile'

describe('Generate Authorization Profiles', () => {
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
  })

  it('Authenticates Wendy (Credential-Issuer)', () => {
    cy.get('@credential-issuer').then(({ user }: any) => {
      cy.visit(login.path)
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
    })
  })

  it('Select the namespace created for client credential ', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      home.useNamespace(clientCredentials.namespace)
    })
  })

  it('Creates authorization profile for Client ID/Secret', () => {
    cy.visit(authProfile.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let ap = clientCredentials.clientIdSecret.authProfile
      authProfile.createAuthProfile(ap)
      cy.get(authProfile.profileTable).contains(ap.name).should('be.visible')
    })
  })
  it('Creates authorization profile for JWT - Generated Key Pair', () => {
    cy.visit(authProfile.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let ap = clientCredentials.jwtKeyPair.authProfile
      authProfile.createAuthProfile(ap)
      cy.get(authProfile.profileTable).contains(ap.name).should('be.visible')
    })
  })
  it('Creates authorization profile for JWKS URL', () => {
    cy.visit(authProfile.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let ap = clientCredentials.jwksUrl.authProfile
      authProfile.createAuthProfile(ap)
      cy.get(authProfile.profileTable).contains(ap.name).should('be.visible')
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})