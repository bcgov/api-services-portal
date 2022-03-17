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
    cy.resetState()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('creates and activates new namespace', () => {
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      home.createNamespace(checkPermission.namespace)
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
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      cy.publishApi('service-permission.yml', checkPermission.namespace).then(() => {
        cy.get('@publishAPIResponse').then((res: any) => {
          cy.log(JSON.stringify(res.body))
        })
      })
    })
  })

  it('creates as new product in the directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      pd.createNewProduct(checkPermission.product.name, checkPermission.product.environment.name)
    })
  })

  it('publish product to directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      pd.editProductEnvironment(checkPermission.product.name, checkPermission.product.environment.name)
      pd.editProductEnvironmentConfig(checkPermission.product.environment.config)
    })
    pd.generateKongPluginConfig('service-permission.yml')
  })

  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      cy.publishApi('service-plugin.yml', checkPermission.namespace).then(() => {
        cy.get('@publishAPIResponse').then((res: any) => {
          cy.log(JSON.stringify(res.body))
        })
      })
    })
  })

  it('update the Dataset in BC Data Catelogue to appear the API in the Directory', () => {

    cy.visit(pd.path)
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      pd.updateDatasetNameToCatelogue(checkPermission.product.name, checkPermission.product.environment.name)
    })
  })
  after(() => {
    cy.logout()
    cy.clearLocalStorage({log:true})
    cy.deleteAllCookies()
  })
})
