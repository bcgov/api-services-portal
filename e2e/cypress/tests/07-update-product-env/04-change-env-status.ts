import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import AuthorizationProfile from '../../pageObjects/authProfile'
import ConsumersPage from '../../pageObjects/consumers'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'
import Products from '../../pageObjects/products'


describe('Change Product environment from active to inactive', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const myAccessPage = new MyAccessPage()
  let consumerid: string
  let consumerNumber: string
  let existingAPIKey: string
  var nameSpace: string
  let userSession: string
  const home = new HomePage()
  const pd = new Products()
  const authProfile = new AuthorizationProfile()
  const appDir = new ApiDirectoryPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/regen').as('regen')
    cy.visit(login.path)
  })

  it('Authenticates api owner', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })
  it('Activates the namespace', () => {
    cy.getUserSession().then(() => {
      cy.get('@apiowner').then(({ namespace }: any) => {
        nameSpace = namespace
        home.useNamespace(namespace)
      })
    })
  })

  it('Change Product environment from active to inactive', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.editProductEnvironment(product.name, product.test_environment.name)
      cy.get('@apiowner').then(({ clientCredentials }: any) => {
        let prod = clientCredentials.clientIdSecret_KongKeyToCC.product
        let authProfile = clientCredentials.clientIdSecret_KongKeyToCC.authProfile
        prod.environment.config.authIssuer = authProfile.name
        prod.environment.config.authIssuerEnv = authProfile.environmentConfig.environment
        pd.editProductEnvironmentConfig(prod.environment.config,true)
      })
    })
  })

  it('Verify that the environment does not display in API directory', () => {
    cy.visit(appDir.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let prod = clientCredentials.clientIdSecret_KongKeyToCC.product
      apiDir.isEnvironmentDisplayInAPIDirectory(prod, false)
    })
  })

  it('Change Product environment from inactive to active', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.editProductEnvironment(product.name, product.test_environment.name)
      cy.get('@apiowner').then(({ clientCredentials }: any) => {
        let prod = clientCredentials.clientIdSecret_KongKeyToCC.product
        let authProfile = clientCredentials.clientIdSecret_KongKeyToCC.authProfile
        prod.environment.config.authIssuer = authProfile.name
        prod.environment.config.authIssuerEnv = authProfile.environmentConfig.environment
        pd.editProductEnvironmentConfig(prod.environment.config)
      })
    })
  })

  it('Verify that the environment displays in API directory', () => {
    cy.visit(appDir.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let prod = clientCredentials.clientIdSecret_KongKeyToCC.product
      apiDir.isEnvironmentDisplayInAPIDirectory(prod, true)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})