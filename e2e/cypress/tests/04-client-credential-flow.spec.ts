import HomePage from '../pageObjects/home'
import LoginPage from '../pageObjects/login'
import AuthorizationProfile from '../pageObjects/authProfile'
import NamespaceAccess from '../pageObjects/namespaceAccess'
import Products from '../pageObjects/products';

describe('Client Credential Flow', () => {

  const home = new HomePage();
  const login = new LoginPage();
  const authProfile = new AuthorizationProfile();
  const nsa = new NamespaceAccess();
  const products = new Products();

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
      home.useNamespace(namespace);
    })
  })

  it('Gives API Owner CredentialIssuer.Admin permission', () => {
    cy.visit(nsa.path);
    cy.get('@apiowner').then(({ user, namespace, namespaceAccessPermissions }: any) => {
      nsa.addNamespaceAccessPermissions(user.credentials.username, namespaceAccessPermissions);
      // Need to log out and log back in for permissions to take effect
      cy.logout();
      cy.get(login.loginButton).click();
      home.useNamespace(namespace);
    })
  })
  
  it('Creates Auth Profile', () => {
    cy.visit(authProfile.path)
    cy.get('@apiowner').then(({ ccAuthProfile }: any) => {
      authProfile.createAuthProfile(ccAuthProfile);
    })
  })

  it('Adds a test environment to "Auto Test Product" product', () => {
    cy.visit(products.path)
    cy.get('@apiowner').then(({ product }: any) => {
      products.addEnvToProduct(product.name, "Test");
    })
  })

  after(() => {
    cy.logout()
  })
})
