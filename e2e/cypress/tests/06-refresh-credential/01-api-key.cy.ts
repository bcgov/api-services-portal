import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'

describe('Regenerate Credential for API Key', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const myAccessPage = new MyAccessPage()
  let consumerid: string
  let consumerNumber: string
  let existingAPIKey: string

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/store').as('store')
    cy.visit(login.path)
  })

  it('authenticates Harley (developer)', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Get the consumer id based on consumer number', () => {
    cy.get('@store').then(({clientid}: any) => {
      cy.makeKongGatewayRequest('consumers', '', 'GET').then((response) => {
        expect(response.status).to.be.equal(200)
        consumerid = Cypress._.get((Cypress._.filter(response.body.data, ["custom_id", clientid]))[0], 'id')
      })
    })
  })

  it('Get current API Key', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.makeKongGatewayRequest('consumers/' + consumerid + '/key-auth', '', 'GET').then((response: any) => {
        expect(response.status).to.be.equal(200)
        existingAPIKey = response.body.data[0].key
      })
    })
  })

  it('Regenrate credential', () => {
    cy.visit(myAccessPage.path)
    cy.get('@developer').then(({ product, application }: any) => {
      myAccessPage.regenerateCredential(product.environment, application.name)
      myAccessPage.clickOnGenerateSecretButton()
      cy.contains("API Key").should('be.visible')
      myAccessPage.saveAPIKeyValue()
    })
  })

  it('Verify that only one API key(new key) is set to the consumer in Kong gateway', () => {
      cy.makeKongGatewayRequest('consumers/' + consumerid + '/key-auth', '', 'GET').then((response: any) => {
        expect(response.status).to.be.equal(200)
        expect(response.body.data.length).to.be.equal(1)
    })
  })

  it('Verify that API is not accessible with the old API Key', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.makeKongRequest(product.environment.config.serviceName, 'GET', existingAPIKey).then((response) => {
        expect(response.status).to.be.oneOf([401, 500])
        // expect(response.body.message).to.be.equal("Invalid authentication credentials")
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})