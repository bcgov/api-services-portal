import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import AuthorizationProfile from '../../pageObjects/authProfile'
import Products from '../../pageObjects/products'

describe('Creates an authorization and applies it to a product environment', () => {
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
  const products = new Products()

  before(() => {
    cy.visit('/')
    cy.clearCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.visit(login.path)
  })

  it('authenticates api owner', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Activates cc namespace', () => {
    cy.get('@apiowner').then(({ namespace }: any) => {
      home.useNamespace(namespace)
    })
  })

  it('API Owner creates authorization profile', () => {
    cy.visit(authProfile.path)
    cy.get('@apiowner').then(({ ccAuthProfile }: any) => {
      authProfile.createAuthProfile(ccAuthProfile)
      cy.get(authProfile.profileTable).contains(ccAuthProfile.name).should('be.visible')
    })
  })

  // it('API Owner adds Test environment to "Auto Test Product" product', () => {
  //   cy.visit(products.path)
  //   cy.get('@apiowner').then(({ product }: any) => {
  //     products.addEnvToProduct(product.name, product.testEnvironment.name)
  //   })
  // })

  // it('Adds client credential flow to Test environment, generates service template with jwt-keycloak plugin', () => {
  //   cy.visit(products.path)
  //   cy.get('@apiowner').then(({ product, ccAuthProfile }: any) => {
  //     products.editProductEnvironment(product.name, product.testEnvironment.name)
  //     product.testEnvironment.config.authIssuer = ccAuthProfile.name
  //     product.testEnvironment.config.authIssuerEnv = ccAuthProfile.environmentConfig.environment
  //     products.editProductEnvironmentConfig(product.testEnvironment.config)
  //   })
  //   // products.generateKongPluginConfig()
  // })

  // it('Applies authorization plugin to service published to Kong Gateway', () => {
  //   cy.publishApi('service-plugin.yml').then(() => {
  //     cy.get('@publishAPIResponse').then((res: any) => {
  //       cy.log(JSON.stringify(res.body))
  //     })
  //   })
  // })

  after(() => {
    cy.logout()
  })
})
