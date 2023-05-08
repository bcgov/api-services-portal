import _ = require("cypress/types/lodash")
import ApiDirectoryPage from "../../pageObjects/apiDirectory"
import ApplicationPage from "../../pageObjects/applications"
import HomePage from "../../pageObjects/home"
import LoginPage from "../../pageObjects/login"
import Products from "../../pageObjects/products"
import MyAccessPage from '../../pageObjects/myAccess'
import ConsumersPage from "../../pageObjects/consumers"
let apiKey: any

describe('Apply Kong API key only plugin', () => {
  var consumerID: string
  var consumerKey: string
  var pluginID: string
  var serviceID: string
  var nameSpace: string
  let userSession: string
  const home = new HomePage()
  const pd = new Products()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('developer').as('developer')
    cy.fixture('state/store').as('store')
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

  it('Deactivate the service for Test environment', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.deactivateService(product.name, product.environment.name, product.environment.config)
      cy.wait(3000)
    })
  })

  it('Create a new consumer and save the consumer Id', () => {
    cy.makeKongGatewayRequest('consumers', 'createConsumer', 'POST').then((response) => {
      expect(response.status).to.be.equal(201)
      consumerID = response.body.id
      cy.saveState("consumersid", consumerID)
    })
  })

  it('Set Consumer ID to key auth anonymous config', () => {
    cy.updatePropertiesOfPluginFile('service-plugin-key-auth-only.yml', 'config.anonymous', consumerID)
  })

  it('Update the authorization scope from Kong ACL-API to Kong API Only', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let product = clientCredentials.KongApiOnly.product
      pd.editProductEnvironment(product.name, product.environment.name)
      pd.editProductEnvironmentConfig(product.environment.config)
    })
  })

  it('Apply Key-auth only authorization plugin to Kong Gateway', () => {
    cy.get('@apiowner').then(({ namespace, product }: any) => {
      cy.updatePluginFile('service-plugin.yml', product.environment.config.serviceName, 'service-plugin-key-auth-only.yml')
      cy.publishApi('service-plugin.yml', namespace).then(() => {
        cy.get('@publishAPIResponse').then((res: any) => {
          cy.log(JSON.stringify(res.body))
        })
      })
    })
  })

  it('activate the service for Dev environment', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      // pd.editProductEnvironment(product.name, product.environment.name)
      pd.activateService(product.name, product.environment.name, product.environment.config)
      cy.wait(3000)
    })
  })

  it('Apply Rate limiting on free access', () => {
    cy.updateKongPlugin('consumers', 'rateLimitingConsumer', 'consumers/'+consumerID+'/plugins').then((response) => {
      expect(response.status).to.be.equal(201)
    })
  })
})

describe('Check the API key for free access', () => {

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/store').as('store')
  })

  it('Verify the service is accessibale with API key for free access', () => {
    cy.get('@apiowner').then(async ({ product }: any) => {
      cy.fixture('state/store').then((creds: any) => {
        const key = creds.consumerKey
        cy.makeKongRequest(product.environment.config.serviceName, 'GET','').then((response) => {
          expect(response.status).to.be.equal(200)
          expect(parseInt(response.headers["x-ratelimit-remaining-hour"])).to.be.equal(99)
        })
      })
    })
  })
})

describe('Check the API key for Elevated access', () => {

  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const ma = new MyAccessPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    // cy.visit(login.path)
  })

  it('Developer logs in', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('creates an application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ elevatedAccess }: any) => {
      app.createApplication(elevatedAccess.application)
    })
  })

  it('Collect the credentials', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(async ({ elevatedAccess, accessRequest }: any) => {
      apiDir.createAccessRequest(elevatedAccess.product, elevatedAccess.application, accessRequest, true)
      ma.clickOnGenerateSecretButton()
      cy.contains("API Key").should('be.visible')
      cy.get(ma.apiKyeValueTxt).invoke('val').then(($apiKey: any) => {
        apiKey = $apiKey
      })
      ma.saveAPIKeyValue()
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Approve Pending Request Spec', () => {
  const login = new LoginPage()
  const consumers = new ConsumersPage()
  const home = new HomePage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
    cy.getServiceOrRouteID('services')
    cy.getServiceOrRouteID('routes')
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('manage-control-config-setting').as('manage-control-config-setting')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('developer').as('developer')
    cy.fixture('state/store').as('store')
    // cy.visit(login.path)
  })

  it('authenticates Mark (Access-Manager)', () => {
    cy.get('@access-manager').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      home.useNamespace(namespace);
    })
  })

  it('verify the request details', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.get('@developer').then(({ accessRequest, elevatedAccess }: any) => {
        cy.visit(consumers.path);
        consumers.reviewThePendingRequest()
        consumers.verifyRequestDetails(product, accessRequest, elevatedAccess.application)
      })
    })
  })

  it('Navigate to Control Tab', () => {
    cy.contains('Controls').click()
  })

  it('Set Rate Limiting', () => {
    cy.get('@manage-control-config-setting').then(({ rateLimiting }: any) => {
      consumers.setRateLimitingWithOutConsumerID(rateLimiting.requestPerHour_Elevated, 'Route')
    })
  })

  it('approves an access request', () => {
    consumers.approvePendingRequest()
  })

  it('Verify that API is accessible with the generated API Key', () => {
    cy.get('@apiowner').then(async ({ product }: any) => {
      cy.makeKongRequest(product.environment.config.serviceName, 'GET', apiKey).then((response) => {
        expect(response.status).to.be.equal(200)
        expect(parseInt(response.headers["x-ratelimit-remaining-hour"])).to.be.equal(249)
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})
