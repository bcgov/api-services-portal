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
let namespace: string
let displayName: string

describe('Add Organization to publish API', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()
  const ns = new NameSpacePage()
  const pd = new Products()
  const sa = new ServiceAccountsPage()
  const apiDir = new ApiDirectoryPage()
  let userSession: any


  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload(true)
    cy.resetState()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.get('@common-testdata').then(({ apiTest }: any) => {
      cy.getUserSessionTokenValue(apiTest.namespace, false).then((value) => {
        userSession = value
      })
    })
  })

  it('Set token with gwa config command', () => {
    cy.exec('gwa config set --token ' + userSession, { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
      expect(response.stdout).to.contain("Config settings saved")
    });
  })

  it('create namespace', () => {
    cy.createGateway().then((response) => {
      namespace = response.gatewayId
      displayName = response.displayName
      cy.log('New namespace created: ' + namespace)
      cy.updateJsonValue('common-testdata.json', 'orgAssignment.namespace', namespace)
      // cy.updateJsonValue('apiowner.json', 'clientCredentials.clientIdSecret.product.environment.name.config.serviceName', 'cc-service-for-' + namespace)
      cy.executeCliCommand("gwa config set --gateway " + namespace)
    });
  })

  it('activates new namespace', () => {
    cy.activateGateway(namespace)
  })

  it('creates a new service account', () => {
    cy.visit(sa.path)
    cy.get('@apiowner').then(({ serviceAccount }: any) => {
      sa.createServiceAccount(serviceAccount.scopes)
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
      pd.editProductEnvironmentConfig(orgAssignment.product.environment.config)
      pd.generateKongPluginConfig(orgAssignment.product.name, orgAssignment.product.environment.name, 'org-service.yml')
    })
  })

  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.replaceWordInJsonObject('ns.orgassignment', 'ns.' + namespace, 'org-service-plugin.yml')
    cy.publishApi('org-service-plugin.yml', namespace).then((response: any) => {
      expect(response.stdout).to.contain('Sync successful');
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

  it('Verify My Gateways shows publishing "disabled"', () => {
    cy.visit(ns.listPath)
    cy.get(`[data-testid="ns-list-item-${namespace}"]`).should('contain.text', 'Publishing disabled')
    cy.get(ns.listFilterSelect).select('disabled')
    cy.get(`[data-testid="ns-list-item-${namespace}"]`).should('exist')
    cy.get(ns.listFilterSelect).select('enabled')
    cy.get(`[data-testid="ns-list-item-${namespace}"]`).should('not.exist')
  })

  it('Assign organization to the created namespace', () => {
    cy.visit(apiDir.path)
    cy.get('@apiowner').then(({ product }: any) => {
      apiDir.addOrganizationAndOrgUnit(product)
    })
  })

  it('Verify My Gateways shows publishing "pending"', () => {
    cy.visit(ns.listPath)
    cy.get(`[data-testid="ns-list-item-${namespace}"]`).should('contain.text', 'Pending publishing permission')
    cy.get(ns.listFilterSelect).select('pending')
    cy.get(`[data-testid="ns-list-item-${namespace}"]`).should('exist')
    cy.get(ns.listFilterSelect).select('enabled')
    cy.get(`[data-testid="ns-list-item-${namespace}"]`).should('not.exist')
  })

  it('Verify Organization Administrator notification banner', () => {
    cy.visit(apiDir.path)
    cy.get('@apiowner').then(({ orgAssignment }: any) => {
      cy.replaceWord(orgAssignment.orgAdminNotification.parent, 'orgassignment', displayName).then((updatedNotification: string) => {
        apiDir.checkOrgAdminNotificationBanner(updatedNotification, orgAssignment.orgAdminNotification.child)
      })
    })
  })

  after(() => {
    cy.logout()
  })
})

describe('Org Admin approves the request', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const ns = new NameSpacePage()
  const product = new Products()

  before(() => {
    cy.visit('/')
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('product-owner').as('product-owner')
    cy.fixture('common-testdata').as('common-testdata')
    // cy.visit(login.path)
  })

  it('Authenticates Product Owner', () => {
    cy.get('@product-owner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Select the namespace', () => {
    cy.activateGateway(namespace)
  })

  it('Click on Enable Publishing option from Namespace Page', () => {
    cy.visit(ns.detailPath)
    cy.wait(2000)
    cy.contains('a', 'Enable Publishing').click()
    cy.wait(2000)
  })

  it('Publish the API', () => {
    product.changePublishAPIStatus(true)
  })

  after(() => {
    cy.logout()
  })

})

describe('Activate the API to make it visible in API Directory', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const ns = new NameSpacePage()
  const pd = new Products()
  const apiDir = new ApiDirectoryPage()

  before(() => {
    cy.visit('/')
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    // cy.visit(login.path)
  })

  it('Authenticates api owner', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      cy.activateGateway(namespace)
    })
  })

  it('Verify My Gateways shows publishing "enabled"', () => {
    cy.visit(ns.listPath)
    cy.get(`[data-testid="ns-list-item-${namespace}"]`).should('contain.text', 'Publishing enabled')
    cy.get(ns.listFilterSelect).select('enabled')
    cy.get(`[data-testid="ns-list-item-${namespace}"]`).should('exist')
    cy.get(ns.listFilterSelect).select('disabled')
    cy.get(`[data-testid="ns-list-item-${namespace}"]`).should('not.exist')
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
      apiDir.isProductDisplay(product, true)
    })
  })

  after(() => {
    cy.logout()
  })
})

describe('Request service Access Spec', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const myAccessPage = new MyAccessPage()

  before(() => {
    cy.visit('/')
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
  })
})

describe('Access manager approves developer access request for Kong API ACL authenticator', () => {
  const home = new HomePage()
  const login = new LoginPage()
  const consumers = new ConsumersPage()

  before(() => {
    cy.visit('/')
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('apiowner').as('apiowner')
    // cy.visit(login.path)
  })

  it('Access Manager logs in', () => {
    cy.get('@access-manager').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      cy.activateGateway(namespace)
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
  })
})
