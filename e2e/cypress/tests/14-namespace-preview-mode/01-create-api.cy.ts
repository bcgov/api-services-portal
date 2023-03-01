import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import Products from '../../pageObjects/products'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'

describe('Create API Spec', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const sa = new ServiceAccountsPage()
  const pd = new Products()
  var nameSpace: string
  let userSession: string

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
    cy.resetState()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('api').as('api')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('creates and activates new namespace', () => {
    cy.getUserSession().then(() => {
      cy.get('@apiowner').then(({ namespacePreview }: any) => {
        nameSpace = namespacePreview.namespace
        home.createNamespace(namespacePreview.namespace)
        cy.get('@login').then(function (xhr: any) {
          userSession = xhr.response.headers['x-auth-request-access-token']
        })
      })
    })
  })

  it('creates a new service account', () => {
    cy.visit(sa.path)
    cy.get('@apiowner').then(({ namespacePreview }: any) => {
      sa.createServiceAccount(namespacePreview.serviceAccount.scopes)
    })
    sa.saveServiceAcctCreds()
  })

  it('publishes a new API to Kong Gateway', () => {
    cy.get('@apiowner').then(({ namespacePreview }: any) => {
      cy.publishApi('service-permission.yml', namespacePreview.namespace).then(() => {
        cy.get('@publishAPIResponse').then((res: any) => {
          cy.log(JSON.stringify(res.body))
        })
      })
    })
  })

  it('creates as new product in the directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ namespacePreview }: any) => {
      pd.createNewProduct(namespacePreview.product.name, namespacePreview.product.environment.name)
    })
  })

  it('update the Dataset in BC Data Catelogue to appear the API in the Directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ namespacePreview }: any) => {
      pd.updateDatasetNameToCatelogue(namespacePreview.product.name, namespacePreview.product.environment.name)
    })
  })

  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.get('@apiowner').then(({ namespacePreview }: any) => {
      cy.publishApi('service-permission.yml', namespacePreview.namespace).then(() => {
        cy.get('@publishAPIResponse').then((res: any) => {
        })
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({log:true})
    cy.deleteAllCookies()
  })
})
