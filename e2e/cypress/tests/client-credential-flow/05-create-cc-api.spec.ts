import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import Products from '../../pageObjects/products'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'


describe('Create API Spec', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const sa = new ServiceAccountsPage()
  const pd = new Products()

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

  it('authenticates api owner', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Activates cc namespace', () => {
    cy.get('@apiowner').then(({ clientCredentialsNamespace }: any) => {
      home.useNamespace(clientCredentialsNamespace)
    })
  })

  it('creates a new service account', () => {
    cy.visit(sa.path)
    cy.get('@apiowner').then(({ serviceAccount }: any) => {
      sa.createServiceAccount(serviceAccount.scopes)
    })
    sa.saveServiceAcctCreds()
  })

  it('publishes a new API to Kong Gateway', () => {
    cy.get('@apiowner').then(({clientCredentialsNamespace}: any) => {
      cy.publishApi('cc-service.yml', clientCredentialsNamespace).then(() => {
        cy.get('@publishAPIResponse').then((res: any) => {
          cy.log(JSON.stringify(res.body))
        })
      })
    })
  })

  it('creates as new product in the directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentialsProduct }: any) => {
      pd.createNewProduct(clientCredentialsProduct.name, clientCredentialsProduct.environment.name)
    })
  })
  it('publish product to directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentialsProduct, ccAuthProfile }: any) => {
      pd.editProductEnvironment(clientCredentialsProduct.name, clientCredentialsProduct.environment.name)
      clientCredentialsProduct.environment.config.authIssuer = ccAuthProfile.name
      clientCredentialsProduct.environment.config.authIssuerEnv = ccAuthProfile.environmentConfig.environment
      pd.editProductEnvironmentConfig(clientCredentialsProduct.environment.config)
    })
    pd.generateKongPluginConfig('cc-service.yml')
  })
  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.get('@apiowner').then(({clientCredentialsNamespace}: any) => {
      cy.publishApi('cc-service-plugin.yml', clientCredentialsNamespace).then(() => {
        cy.get('@publishAPIResponse').then((res: any) => {
          cy.log(JSON.stringify(res.body))
        })
      })
    })
  })
  it('update the Dataset in BC Data Catelogue to appear the API in the Directory', () => {

    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentialsProduct }: any) => {
      pd.updateDatasetNameToCatelogue(clientCredentialsProduct.name, clientCredentialsProduct.environment.name)
    })
  })
  after(() => {
    cy.logout()
    cy.clearLocalStorage({log:true})
    cy.deleteAllCookies()
  })
})
