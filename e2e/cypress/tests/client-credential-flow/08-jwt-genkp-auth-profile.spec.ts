import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import AuthorizationProfile from '../../pageObjects/authProfile'
import Products from '../../pageObjects/products'

describe('Creates an authorization for JWT Generated Key Pair and applies it to a product environment', () => {
  const home = new HomePage()
  const login = new LoginPage()
  const authProfile = new AuthorizationProfile()
  const pd = new Products()

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
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      home.useNamespace(clientCredentials.namespace)
    })
  })

  it('API Owner creates authorization profile for JWT - Generated Key Pair', () => {
    cy.visit(authProfile.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let ap = clientCredentials.jwtKeyPair.authProfile
      authProfile.createAuthProfile(ap)
      cy.get(authProfile.profileTable).contains(ap.name).should('be.visible')
    })
  })

  it('API Adds Environment for JWT - Generated Key Pair to Client Credentials Test Product', () => {
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
  })

  after(() => {
    cy.logout()
  })
})
