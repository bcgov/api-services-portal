import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import ConsumersPage from '../../pageObjects/consumers'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'
import Products from '../../pageObjects/products'

describe('Change Authorization profile', () => {
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

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/regen').as('regen')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('Authenticates api owner', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })
  it('Activates the namespace', () => {
    cy.getUserSession().then(() => {
      cy.get('@common-testdata').then(({ clientCredentials }: any) => {
        nameSpace = clientCredentials.namespace
        home.useNamespace(clientCredentials.namespace)
        cy.get('@login').then(function (xhr: any) {
          userSession = xhr.response.headers['x-auth-request-access-token']
        })
      })
    })
  })

  it('Deactivate the service for Test environment', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let product = clientCredentials.clientIdSecret_authProfile.product
      pd.deactivateService(product.name, product.environment.name, product.environment.config)
      cy.wait(3000)
    })
  })

  it('Update the authorization scope from Kong ACL-API to Client Credential', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let product = clientCredentials.clientIdSecret_authProfile.product
      pd.editProductEnvironment(product.name, product.environment.name)
      pd.editProductEnvironmentConfig(product.environment.config)
      pd.generateKongPluginConfigForAuthScope(product.name, product.environment.name, 'cc-service-plugin.yml', product.environment.config.serviceName)
    })
  })

  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.get('@common-testdata').then(({ clientCredentials }: any) => {
      cy.publishApi('cc-service-plugin.yml', clientCredentials.namespace,true).then(() => {
        // cy.get('@publishAPIResponse').then((res: any) => {
        //   cy.log(JSON.stringify(res.body))
        //   expect(res.body.message).to.contains("Sync successful")
        // })
      })
    })
  })

  it('activate the service for Test environment', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      cy.wait(2000)
      let product = clientCredentials.clientIdSecret_authProfile.product
      pd.activateService(product.name, product.environment.name, product.environment.config)
      cy.wait(3000)
    })
  })

  it('Verify that service is not accessible with existing Client ID - Secret credentials', () => {
    cy.readFile('cypress/fixtures/state/regen.json').then((store_res) => {
      let cc = JSON.parse(store_res.clientidsecret)
      cy.getAccessToken(cc.clientId, cc.clientSecret).then(() => {
        cy.get('@accessTokenResponse').then((token_res: any) => {
          let token = token_res.body.access_token
          cy.get('@apiowner').then(({ clientCredentials }: any) => {
            cy.makeKongRequest(clientCredentials.serviceName, 'GET', token).then((response) => {
              expect(response.status).to.be.equal(401)
            })
          })
        })
      })
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
    cy.get('@developer').then(({ clientCredentials }: any) => {
      app.createApplication(clientCredentials.kongAPI_ACL_authProfile.application)
    })
  })

  it('Raise request access', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ clientCredentials, accessRequest }: any) => {
      let product = clientCredentials.kongAPI_ACL_authProfile.product
      let app = clientCredentials.kongAPI_ACL_authProfile.application
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
    cy.fixture('common-testdata').as('common-testdata')
    // cy.visit(login.path)
  })

  it('Access Manager logs in', () => {
    cy.get('@access-manager').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ clientCredentials }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        home.useNamespace(clientCredentials.namespace)
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
      cy.get('@apiowner').then(({ clientCredentials }: any) => {
        let product = clientCredentials.clientIdSecret_authProfile.product
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
