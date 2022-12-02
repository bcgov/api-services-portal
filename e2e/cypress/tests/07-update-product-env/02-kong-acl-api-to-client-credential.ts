import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import AuthorizationProfile from '../../pageObjects/authProfile'
import ConsumersPage from '../../pageObjects/consumers'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'
import Products from '../../pageObjects/products'


describe('Change Authorization profile from Kong ACL-API to Client Credential', () => {
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

  it('Create an authorization profile', () => {
    cy.visit(authProfile.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let ap = clientCredentials.clientIdSecret_KongKeyToCC.authProfile
      authProfile.createAuthProfile(ap)
      cy.get(authProfile.profileTable).contains(ap.name).should('be.visible')
    })
  })

  it('Deactivate the service for Test environment', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.deactivateService(product.name, product.test_environment.name,product.test_environment.config)
      cy.wait(3000)
    })
  })

  it('Update the authorization scope from Kong ACL-API to Client Credential', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.editProductEnvironment(product.name, product.test_environment.name)
      cy.get('@apiowner').then(({ clientCredentials }: any) => {
        let prod = clientCredentials.clientIdSecret_KongKeyToCC.product
        let authProfile = clientCredentials.clientIdSecret_KongKeyToCC.authProfile
        prod.environment.config.authIssuer = authProfile.name
        prod.environment.config.authIssuerEnv = authProfile.environmentConfig.environment
        pd.editProductEnvironmentConfig(prod.environment.config)
        debugger
        pd.generateKongPluginConfigForAuthScope(product.name, product.test_environment.name, 'service-plugin.yml',product.test_environment.config.serviceName)
        // pd.generateKongPluginConfig(product.name, product.test_environment.name,'service-test.yml')
      })
    })
  })

  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.get('@apiowner').then(({ namespace }: any) => {
      cy.publishApi('service-plugin.yml', nameSpace).then(() => {
        cy.get('@publishAPIResponse').then((res: any) => {
          debugger
          cy.log(JSON.stringify(res.body))
          expect(res.body.message).to.contains("Sync successful")
        })
      })
    })
  })

  it('activate the service for Test environment', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.activateService(product.name, product.test_environment.name,product.test_environment.config)
      cy.wait(3000)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})

describe('Developer creates an access request for Client ID/Secret authenticator', () => {
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

  it('Creates an application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ clientCredentials }: any) => {
      app.createApplication(clientCredentials.clientIdSecret_KongKeyToCC.application)
    })
  })

  it('Creates an access request', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ clientCredentials, accessRequest }: any) => {
      let product = clientCredentials.clientIdSecret_KongKeyToCC.product
      let app = clientCredentials.clientIdSecret_KongKeyToCC.application

      apiDir.createAccessRequest(product, app, accessRequest)
      ma.clickOnGenerateSecretButton()

      cy.contains('Client ID').should('be.visible')
      cy.contains('Client Secret').should('be.visible')
      cy.contains('Token Endpoint').should('be.visible')
      debugger
      cy.log(Cypress.env('clientidsecret'))
      debugger
      ma.saveClientCredentials(false, true)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Access manager approves developer access request for Client ID/Secret authenticator', () => {
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
    cy.get('@access-manager').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      home.useNamespace(namespace)
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

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Make an API request using Client ID, Secret, and Access Token', () => {
  it('Get access token using client ID and secret; make API request', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {

      let cc = JSON.parse(store_res.clientidsecret)
      debugger
      // let cc = JSON.parse(Cypress.env('clientidsecret'))
      cy.log('cc-->' + cc.clientSecret)
      debugger
      cy.getAccessToken(cc.clientId, cc.clientSecret).then(() => {
        cy.get('@accessTokenResponse').then((token_res: any) => {
          let token = token_res.body.access_token
          cy.request({
            url: Cypress.env('KONG_URL'),
            headers: {
              Host: 'a-service-for-newplatform-test.api.gov.bc.ca',
            },
            auth: {
              bearer: token,
            },
          }).then((res) => {
            expect(res.status).to.eq(200)
          })
        })
      })
    })
  })
})

