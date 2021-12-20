import HomePage from '../pageObjects/home'
import LoginPage from '../pageObjects/login'
import AuthorizationProfile from '../pageObjects/authProfile'
import NamespaceAccess from '../pageObjects/namespaceAccess'
import Products from '../pageObjects/products'
import ApplicationPage from '../pageObjects/applications'
import ApiDirectoryPage from '../pageObjects/apiDirectory'
import ServiceAccountsPage from '../pageObjects/serviceAccounts'
import ConsumersPage from '../pageObjects/consumers'


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
  const apiDir = new ApiDirectoryPage()  
  const app = new ApplicationPage()
  const sa = new ServiceAccountsPage()
  const consumers = new ConsumersPage()

  before(() => {
    cy.visit('/')
    cy.clearCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('developer').as('developer')
    cy.visit(login.path)
  })

  it('Logs in as API Owner', () => {
    cy.get('@apiowner').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      home.useNamespace(namespace)
    })
  })

  it('Gives API Owner CredentialIssuer.Admin and Access.Manage permission', () => {
    cy.visit(nsa.path)
    cy.get('@apiowner').then(({ user, namespace, namespaceAccessPermissions }: any) => {
      nsa.clickGrantUserAccessButton()
      nsa.grantPermission({userName: user.credentials.username, accessRole: namespaceAccessPermissions})
      cy.visit('/').then(() => {
        // TODO there appears to be some flakiness with this logging in and logging out step
        cy.logout()
        cy.login(user.credentials.username, user.credentials.password)
        home.useNamespace(namespace)
      })
    })
  })

  it('Creates Auth Profile', () => {
    cy.visit(authProfile.path)
    cy.get('@apiowner').then(({ ccAuthProfile }: any) => {
      authProfile.createAuthProfile(ccAuthProfile)
      cy.get(authProfile.profileTable).contains(ccAuthProfile.name).should('be.visible')
    })
    
    cy.log('profile created!')
  })

  it('Adds Test environment to "Auto Test Product" product', () => {
    cy.visit(products.path)
    cy.get('@apiowner').then(({ product }: any) => {
      products.addEnvToProduct(product.name, product.testEnvironment.name)
    })
  })

  it('Adds Client Credential Flow to Test environment, generates template with jwt-keycloak plugin', () => {
    cy.visit(products.path)
    cy.get('@apiowner').then(({ product, ccAuthProfile }: any) => {
      products.editProductEnvironment(product.name, product.testEnvironment.name)
      product.testEnvironment.config.authIssuer = ccAuthProfile.name
      product.testEnvironment.config.authIssuerEnv = ccAuthProfile.environmentConfig.environment
      products.editProductEnvironmentConfig(product.testEnvironment.config)
    })
    products.generateKongPluginConfig()
  })

  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.publishApi('service-plugin.yml').then(() => {
      cy.get('@publishAPIResponse').then((res: any) => {
        cy.log(JSON.stringify(res.body))
      })
    })
  })

  it('API Owner logs out', () => {
    cy.logout()
  })

  it('Developer logs in', () => {
    cy.get('@developer').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      // home.useNamespace(namespace)
    })
  })

  it('creates an application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ clientCredentialsApplication }: any) => {
      app.createApplication(clientCredentialsApplication)
    })
  })

  it('creates an access request', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ product, clientCredentialsApplication, accessRequest }: any) => {
      product.environment = 'test';
      apiDir.createAccessRequest(product, clientCredentialsApplication, accessRequest)
      sa.checkClientCredentialsVisible();
      sa.saveClientCredentials();
    })
  })

  it('developer logs out', () => {
    cy.logout();
  })

  it('API Owner Logs in', () => {
    cy.get('@apiowner').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      home.useNamespace(namespace)
    })
  })

  it('approves an access request', () => {
    // TODO: change this so it uses access-manager
    cy.get('@apiowner').then(({ user, namespace }: any) => {
        cy.visit(consumers.path);
        cy.contains('Review').click()
        cy.contains('Approve').click()
        // TODO this isn't working:
        // cy.contains('span','Complete', { timeout: 10000 }).should('be.visible');
    })
  })

  it('Gets access token using client ID and secret; make API request', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((res) => {
      let cc = JSON.parse(res.clientCredentials);
      cy.getAccessToken(cc.clientId, cc.clientSecret).then(() => {
        cy.get('@accessTokenResponse').then((res : any) => {
          let token = res.body.access_token
          cy.log(token)
          cy.request({
            url: Cypress.env('KONG_URL'),
            headers: {
              Host: 'a-service-for-platform.api.gov.bc.ca'
            },
            auth: {
              bearer: token
            },
          }).then((res) => {
            expect(res.status).to.eq(200)
          })
        })
      });
    })
  })

  after(() => {
    cy.logout()
  })
})

// TODO send request to API after get token