import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import ConsumersPage from '../../pageObjects/consumers'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'
import Products from '../../pageObjects/products'

describe('Verify for Kong Public Auth', () => {
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
      let product = clientCredentials.clientIdSecret_publicProfile.product
      pd.deactivateService(product.name, product.environment.name, product.environment.config)
      cy.wait(3000)
    })
  })

  it('Update the authorization scope from Kong ACL-API to Client Credential', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let product = clientCredentials.clientIdSecret_publicProfile.product
      pd.editProductEnvironment(product.name, product.environment.name)
      pd.editProductEnvironmentConfig(product.environment.config)
    })
  })

  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.get('@common-testdata').then(({ clientCredentials }: any) => {
      cy.publishApi('cc-service-gwa.yml', clientCredentials.namespace,true).then((response:any) => {
        expect(response.stdout).to.contain('Sync successful');
      })
    })
  })

  it('activate the service for Test environment', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      cy.wait(2000)
      let product = clientCredentials.clientIdSecret_publicProfile.product
      pd.activateService(product.name, product.environment.name, product.environment.config)
      cy.wait(3000)
    })
  })

  it('Verify that API is accessible with out any credential', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_cred) => {
      cy.get('@apiowner').then(({ clientCredentials }: any) => {
        let product = clientCredentials.clientIdSecret_authProfile.product
        cy.makeKongRequest(product.environment.config.serviceName, 'GET','').then((response) => {
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