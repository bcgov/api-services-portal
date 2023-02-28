import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NameSpacePage from '../../pageObjects/namespace'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
import Products from '../../pageObjects/products'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'
import MyAccessPage from '../../pageObjects/myAccess'
import ConsumersPage from '../../pageObjects/consumers'


describe('Add Organization to publish API', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()
  const pd = new Products()
  const sa = new ServiceAccountsPage()
  const apiDir = new ApiDirectoryPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
    cy.resetState()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    // cy.visit(login.path)
  })

  it('Authenticates api owner', () => {
    cy.get('@apiowner').then(({ user, orgAssignment }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      // home.useNamespace(orgAssignment.namespace)
    })
  })

  it('Creates and activates new namespace', () => {
    cy.get('@apiowner').then(({ orgAssignment }: any) => {
      home.createNamespace(orgAssignment.namespace)
    })
  })

  it('creates a new service account', () => {
    cy.visit(sa.path)
    cy.get('@apiowner').then(({ serviceAccount }: any) => {
      sa.createServiceAccount(serviceAccount.scopes)
      cy.wait(6000)
    })
    sa.saveServiceAcctCreds()
  })

  it('Grant namespace access to access manager(Mark)', () => {
    cy.get('@apiowner').then(({ orgAssignment }: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission(orgAssignment.Mark)
    })
  })

  it('creates as new product in the directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ orgAssignment }: any) => {
      pd.createNewProduct(orgAssignment.product.name, orgAssignment.product.environment.name)
    })
  })

  it('Update the product environment', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ orgAssignment }: any) => {
      pd.editProductEnvironment(orgAssignment.product.name, orgAssignment.product.environment.name)
      debugger
      pd.editProductEnvironmentConfig(orgAssignment.product.environment.config)
      pd.generateKongPluginConfig(orgAssignment.product.name, orgAssignment.product.environment.name, 'org-service.yml')
    })
  })

  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.get('@apiowner').then(({ orgAssignment }: any) => {
      cy.publishApi('org-service-plugin.yml', orgAssignment.namespace).then(() => {
        cy.get('@publishAPIResponse').then((res: any) => {
          cy.log(JSON.stringify(res.body))
          expect(res.body.message).to.contains("Sync successful")
        })
      })
    })
  })

  it('Navigate to API Directory Page ', () => {
    cy.visit(apiDir.path)
  })

  it('Verify that created Product is not displayed under API Directory', () => {
    cy.get('@apiowner').then(({ orgAssignment }: any) => {
      let product = orgAssignment.product.name
      apiDir.isProductDisplay(product, true)
    })
  })

  it('Assign organization to the created namespace', () => {
    cy.visit(apiDir.path)
    cy.get('@apiowner').then(({ product }: any) => {
      apiDir.addOrganizationAndOrgUnit(product)
    })
  })

  it('Verify Organization Administrator notification banner', () => {
    cy.visit(apiDir.path)
    cy.get('@apiowner').then(({ orgAssignment }: any) => {
    apiDir.checkOrgAdminNotificationBanner(orgAssignment.orgAdminNotification)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Org Admin approves the request', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const ns = new NameSpacePage()
  const product = new Products()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
    cy.resetState()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('product-owner').as('product-owner')
    // cy.visit(login.path)
  })

  it('Authenticates Product Owner', () => {
    cy.get('@product-owner').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Select the namespace', () => {
    cy.get('@product-owner').then(({ namespace }: any) => {
      home.useNamespace(namespace)
    })
  })

  it('Clik on Enable Publishing option from Namespace Page', () => {
    cy.visit(ns.path)
    cy.wait(2000)
    cy.contains('a', 'Enable Publishing').click()
    cy.wait(2000)
  })

  it('Publish the API', () => {
    product.changePublishAPIStatus(true)
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})

describe('Activate the API to make it visible in API Directory', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const pd = new Products()
  const apiDir = new ApiDirectoryPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
    cy.resetState()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    // cy.visit(login.path)
  })

  it('Authenticates api owner', () => {
    cy.get('@apiowner').then(({ user, orgAssignment }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      home.useNamespace(orgAssignment.namespace)
    })
  })

  it('update the Dataset in BC Data Catelogue to appear the API in the Directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ orgAssignment }: any) => {
      pd.updateDatasetNameToCatelogue(orgAssignment.product.name, orgAssignment.product.environment.name)
    })
  })

  it('Activate the API', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ orgAssignment }: any) => {
      pd.editProductEnvironment(orgAssignment.product.name, orgAssignment.product.environment.name)
      pd.editProductEnvironmentConfig(orgAssignment.product.environment.config)
    })
  })

  it('Navigate to API Directory Page ', () => {
    cy.visit(apiDir.path)
  })

  it('Verify that created Product is displayed under API Directory', () => {
    cy.get('@apiowner').then(({ orgAssignment }: any) => {
      let product = orgAssignment.product.name
      // cy.contains('button').click()
      apiDir.isProductDisplay(product,true)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Request service Access Spec', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const myAccessPage = new MyAccessPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
  })

  it('authenticates Harley (developer)', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('creates an application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ orgAssignment }: any) => {
      app.createApplication(orgAssignment.application)
    })
  })

  it('Raise request access', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ orgAssignment, accessRequest }: any) => {
      let product = orgAssignment.product
      let app = orgAssignment.application
      apiDir.createAccessRequest(product, app, accessRequest)
    })
  })

  it('Collect the credentials', () => {
    myAccessPage.clickOnGenerateSecretButton()
    cy.contains("API Key").should('be.visible')
    myAccessPage.saveAPIKeyValue()
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Access manager approves developer access request for Kong API ACL authenticator', () => {
  const home = new HomePage()
  const login = new LoginPage()
  const consumers = new ConsumersPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('apiowner').as('apiowner')
    // cy.visit(login.path)
  })

  it('Access Manager logs in', () => {
    cy.get('@apiowner').then(({ orgAssignment }: any) => {
      cy.get('@access-manager').then(({ user}: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        home.useNamespace(orgAssignment.namespace)
      })
    })
  })

  it('Access Manager approves developer access request', () => {
    cy.get('@access-manager').then(() => {
      cy.visit(consumers.path)
      consumers.reviewThePendingRequest()
    })
  })

  it('approves an access request', () => {
    consumers.approvePendingRequest()
  })

  it('Verify that API is accessible with the generated API Key', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_cred) => {
      cy.get('@apiowner').then(({ orgAssignment }: any) => {
        let product = orgAssignment.product
        cy.makeKongRequest(product.environment.config.serviceName, 'GET', store_cred.apikey).then((response) => {
          cy.log(response)
          expect(response.status).to.be.equal(200)
        })
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
