import HomePage from '../pageObjects/home'
import LoginPage from '../pageObjects/login'
import Products from '../pageObjects/products'
import ServiceAccountsPage from '../pageObjects/serviceAccounts'

describe('Create API Spec', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const sa = new ServiceAccountsPage()
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
      cy.log('Logged in!')
    })
  })

  it('creates and activates new namespace', () => {
    cy.get('@apiowner').then(({ namespace }: any) => {
      home.createNamespace(namespace)
    })
  })

  it('creates a new service account', () => {
    cy.visit(sa.path)
    cy.get('@apiowner').then(({ serviceAccount, namespace }: any) => {
      // home.useNamespace(namespace)
      sa.createServiceAccount(serviceAccount.scopes)
    })
    sa.saveServiceAcctCreds()
  })

  it('publishes a new API to Kong Gateway', () => {
    cy.publishApi('service.yml').then(() => {
      cy.get('@publishAPIResponse').then((res: any) => {
        cy.log(JSON.stringify(res.body))
      })
    })
  })
  it('creates as new product in the directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.createNewProduct(product.name, product.environment.name)
    })
  })
  it('publish product to directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.editProductEnvironment(product.name, product.environment.name)
      pd.editProductEnvironmentConfig(product.environment.config)
    })
    pd.generateKongPluginConfig()
  })
  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.publishApi('service-plugin.yml').then(() => {
      cy.get('@publishAPIResponse').then((res: any) => {
        cy.log(JSON.stringify(res.body))
      })
    })
  })

  it('update the Dataset in BC Data Catelogue to appear the API in the Directory', () => {

    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.updateDatasetNameToCatelogue(product.name, product.environment.name)
    })
  })
  after(() => {
    cy.logout()
  })
})
