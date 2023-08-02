import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import ConsumersPage from '../../pageObjects/consumers'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'
import Products from '../../pageObjects/products'

describe('Reset Authorization profile to default (without any role)', () => {
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
      cy.get('@apiowner').then(({ clientCredentials }: any) => {
        nameSpace = clientCredentials.namespace
        home.useNamespace(clientCredentials.namespace)
      })
    })
  })

  it('Generate Kong plugin without configuring any roles', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let product = clientCredentials.clientIdSecret.product
      pd.generateKongPluginConfig(product.name, product.environment.name,'cc-service.yml')
    })
    // pd.generateKongPluginConfig('cc-service.yml')
  })

  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      cy.replaceWordInJsonObject('ccplatform', nameSpace, 'cc-service-plugin.yml')
      cy.publishApi('cc-service-plugin.yml', clientCredentials.namespace,true).then(() => {
        // cy.get('@publishAPIResponse').then((res: any) => {
        //   cy.log(JSON.stringify(res.body))
        //   expect(res.body.message).to.contains("Sync successful")
        // })
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Check service access without applying any roles', () => {
    const login = new LoginPage()
    const myAccessPage = new MyAccessPage()
  
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
  
    it('authenticates Harley (developer)', () => {
      cy.get('@developer').then(({ user }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
      })
    })
  
    it('Regenrate credential client ID and Secret', () => {
      cy.visit(myAccessPage.path)
      cy.get('@developer').then(({ clientCredentials }: any) => {
        myAccessPage.regenerateCredential(clientCredentials.clientIdSecret.product.environment, clientCredentials.clientIdSecret.application.name)
        myAccessPage.clickOnGenerateSecretButton()
        cy.contains('Client ID').should('be.visible')
        cy.contains('Client Secret').should('be.visible')
        cy.contains('Token Endpoint').should('be.visible')
        myAccessPage.saveClientCredentials(true)
      })
    })

  
    it('Verify that service is accessible with new client ID and Secret', () => {
      cy.readFile('cypress/fixtures/state/regen.json').then((store_res) => {
        let cc = JSON.parse(store_res.clientidsecret)
        cy.getAccessToken(cc.clientId, cc.clientSecret).then(() => {
          cy.get('@accessTokenResponse').then((token_res: any) => {
            let token = token_res.body.access_token
            cy.get('@apiowner').then(({ clientCredentials }: any) => {
              cy.makeKongRequest(clientCredentials.serviceName, 'GET', token).then((response) => {
                expect(response.status).to.be.equal(200)
              })
            })
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