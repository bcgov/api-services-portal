import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
import Products from '../../pageObjects/products'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'
import AuthorizationProfile from '../../pageObjects/authProfile'


describe('Create API, Product, and Authorization Profiles; Apply Auth Profiles to Product Environments', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const sa = new ServiceAccountsPage()
  const pd = new Products()
  const authProfile = new AuthorizationProfile()
  var nameSpace: string
  let userSession: string

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('api').as('api')
    cy.visit(login.path)
  })
  it('Authenticates api owner', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })
  it('Activates namespace for client credential flow tests', () => {
    cy.getUserSession().then(() => {
      cy.get('@apiowner').then(({ clientCredentials }: any) => {
        nameSpace = clientCredentials.namespace
        home.useNamespace(clientCredentials.namespace)
        cy.get('@login').then(function (xhr: any) {
          userSession = xhr.response.headers['x-auth-request-access-token']
        })
      })
    })
  })
  it('Creates a new service account', () => {
    cy.visit(sa.path)
    cy.get('@apiowner').then(({ serviceAccount }: any) => {
      sa.createServiceAccount(serviceAccount.scopes)
    })
    sa.saveServiceAcctCreds()
  })
  it('Publishes a new API to Kong Gateway', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      cy.publishApi('cc-service.yml', clientCredentials.namespace).then(() => {
        cy.get('@publishAPIResponse').then((res: any) => {
          cy.log(JSON.stringify(res.body))
        })
      })
    })
  })
  it('Creates a new product in the directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      pd.createNewProduct(
        clientCredentials.clientIdSecret.product.name,
        clientCredentials.clientIdSecret.product.environment.name
      )
    })
  })

  it('Associate Namespace to the organization Unit', () => {
    cy.get('@api').then(({ organization }: any) => {
      cy.setHeaders(organization.headers)
      cy.setAuthorizationToken(userSession)
      cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/' + organization.orgExpectedList.name + '/namespaces/' + nameSpace, 'PUT').then((response) => {
        expect(response.status).to.be.equal(200)
      })
    })
  })

  it('Update the Dataset in BC Data Catalogue to appear the API in the Directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let product = clientCredentials.clientIdSecret.product
      pd.updateDatasetNameToCatelogue(product.name, product.environment.name)
    })
  })

  it('Adds environment with Client ID/Secret authenticator to product', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let product = clientCredentials.clientIdSecret.product
      let authProfile = clientCredentials.clientIdSecret.authProfile
      pd.editProductEnvironment(product.name, product.environment.name)
      product.environment.config.authIssuer = authProfile.name
      product.environment.config.authIssuerEnv = authProfile.environmentConfig.environment
      pd.editProductEnvironmentConfig(product.environment.config)
    })
    pd.generateKongPluginConfig('cc-service.yml')
  })

  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      cy.publishApi('cc-service.yml', clientCredentials.namespace).then(() => {
        cy.get('@publishAPIResponse').then((res: any) => {
          cy.log(JSON.stringify(res.body))
        })
      })
    })
  })

  it('Adds environment with JWT - Generated Key Pair authenticator to product', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let prod = clientCredentials.jwtKeyPair.product
      let ap = clientCredentials.jwtKeyPair.authProfile
      pd.addEnvToProduct(prod.name, prod.environment.name)
      pd.editProductEnvironment(prod.name, prod.environment.name)
      prod.environment.config.authIssuer = ap.name
      prod.environment.config.authIssuerEnv = ap.environmentConfig.environment
      pd.editProductEnvironmentConfig(prod.environment.config)
    })
    pd.generateKongPluginConfig('cc-service.yml')
  })

  it('Adds environment with JWT - JWKS URL authenticator to product', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let prod = clientCredentials.jwksUrl.product
      let ap = clientCredentials.jwksUrl.authProfile
      pd.addEnvToProduct(prod.name, prod.environment.name)
      pd.editProductEnvironment(prod.name, prod.environment.name)
      prod.environment.config.authIssuer = ap.name
      prod.environment.config.authIssuerEnv = ap.environmentConfig.environment
      pd.editProductEnvironmentConfig(prod.environment.config)
    })
    pd.generateKongPluginConfig('cc-service.yml')
  })
  
  it('Applies authorization plugin to service published to Kong Gateway', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      cy.publishApi('cc-service-plugin.yml', clientCredentials.namespace).then(() => {
        cy.get('@publishAPIResponse').then((res: any) => {
          cy.log(JSON.stringify(res.body))
        })
      })
    })
  })

  it('activate the service for Test environment', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let product = clientCredentials.clientIdSecret.product
      pd.editProductEnvironment(product.name, product.environment.name)
      pd.activateService(clientCredentials)
    })
  })

  after(() => {
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
