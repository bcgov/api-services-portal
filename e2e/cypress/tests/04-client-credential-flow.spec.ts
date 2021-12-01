import HomePage from '../pageObjects/home'
import LoginPage from '../pageObjects/login'
import AuthorizationProfile from '../pageObjects/authProfile'
import NamespaceAccess from '../pageObjects/namespaceAccess'
import Products from '../pageObjects/products'

describe('Client Credential Flow', () => {
  /*
  TODO:
  * The following parameters can be added to fixtures/apiowner.json. Functionality executed in pageObjects/authProfile.createAuthProfile *
  - Test with other flows (eg: API Key)
  - Test adding in scopes
  - Test adding in clientRoles
  - Test adding in clientMappers
  - Test adding in uma2ResourceType
  - Test adding in resourceScopes
  - Test adding in resourceAccessScope
  */

  const home = new HomePage()
  const login = new LoginPage()
  const authProfile = new AuthorizationProfile()
  const nsa = new NamespaceAccess()
  const products = new Products()

  before(() => {
    cy.visit('/')
    cy.clearCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    // cy.fixture('developer').as('developer')
    cy.visit(login.path)
  })

  it('Logs in as API Owner', () => {
    cy.get('@apiowner').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      home.useNamespace(namespace)
    })
  })

  it('Gives API Owner CredentialIssuer.Admin permission', () => {
    cy.visit(nsa.path)
    cy.get('@apiowner').then(({ user, namespace, namespaceAccessPermissions }: any) => {
      nsa.addNamespaceAccessPermissions(user.credentials.username, namespaceAccessPermissions)
      // Need to log out and log back in for permissions to take effect
      cy.logout()
      cy.get(login.loginButton).click()
      home.useNamespace(namespace)
    })
  })

  it('Creates Auth Profile', () => {
    cy.visit(authProfile.path)
    cy.get('@apiowner').then(({ ccAuthProfile }: any) => {
      authProfile.createAuthProfile(ccAuthProfile)
    })
  })

  it('Adds Test environment to "Auto Test Product" product', () => {
    cy.visit(products.path)
    cy.get('@apiowner').then(({ product }: any) => {
      products.addEnvToProduct(product.name, product.testEnvironment.name)
    })
  })

  it('Adds Client Credential Flow to Test environment', () => {
    cy.visit(products.path)
    cy.get('@apiowner').then(({ product, ccAuthProfile }: any) => {
      products.editProductEnvironment(product.name, product.testEnvironment.name)
      cy.log('Editing prd env config')
      product.testEnvironment.config.authIssuer = ccAuthProfile.name
      product.testEnvironment.config.authIssuerEnv = ccAuthProfile.environmentConfig.environment
      products.editProductEnvironmentConfig(product.testEnvironment.config)
    })
  })

  after(() => {
    cy.logout()
  })
})
