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

  it('Authenticates api owner', () => {

    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Activates names for client credentials', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      home.useNamespace(clientCredentials.namespace)
    })
  })

  it('API Owner creates authorization profile for client ID/Secret', () => {

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
      let ap = clientCredentials.jwks.authProfile
      authProfile.createAuthProfile(ap)
      cy.get(authProfile.profileTable).contains(ap.name).should('be.visible')
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

  it('Adds environment with Client ID/Secret flow to product', () => {

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

  it('Adds environment with JWT - Generated Key Pair flow to product', () => {

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

  it('Adds environment with JWT - JWKS URL flow to product', () => {

    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let prod = clientCredentials.jwks.product
      let ap = clientCredentials.jwks.authProfile
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
  it('Update the Dataset in BC Data Catalogue to appear the API in the Directory', () => {

    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let product = clientCredentials.clientIdSecret.product
      pd.updateDatasetNameToCatelogue(product.name, product.environment.name)
    })
  })
  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
