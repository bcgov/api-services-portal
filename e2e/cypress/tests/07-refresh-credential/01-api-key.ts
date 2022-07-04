import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'

describe('Regenerate Credential for API Key', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const myAccessPage = new MyAccessPage()
  let consumerid : string

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

  it('Regenrate credential', () => {
    cy.visit(myAccessPage.path)
    cy.get('@developer').then(({ product, application }: any) => {
      myAccessPage.regenerateCredential(product.environment, application.name)
      myAccessPage.clickOnGenerateSecretButton()
      cy.contains("API Key").should('be.visible')
      myAccessPage.saveReGenAPIKeyValue()
    })
  })

  it('Verify that new API key is set to the consumer', () => {
    cy.visit(myAccessPage.path)
    cy.get('@developer').then(({ product, application }: any) => {
      myAccessPage.regenerateCredential(product.environment, application.name)
      myAccessPage.clickOnGenerateSecretButton()
      cy.contains("API Key").should('be.visible')
      myAccessPage.saveReGenAPIKeyValue()
    })
  })

  it('Get the consumer id based on consumer number', () => {
    cy.get('@regen').then((creds: any) => {
      const consumerNumber = creds.consumernumber
      cy.makeKongGatewayRequest('consumers', '', 'GET').then((response) => {
        expect(response.status).to.be.equal(200)
        consumerid = Cypress._.get((Cypress._.filter(response.body.data,["custom_id",consumerNumber]))[0],'id')
      })
    })
  })

  it('Verify that only one API key(new key) is set to the consumer in Kong gateway', () => {
    cy.get('@regen').then((creds: any) => {
      const consumerNumber = creds.consumersid
      cy.makeKongGatewayRequest('consumers/' +consumerid+ '/key-auth', '', 'GET').then((response:any) => {
        expect(response.status).to.be.equal(200)
        expect(response.body.data.length).to.be.equal(1)
      })
    })
  })

  it('Verify that API is not accessible with the old API Key', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
        debugger
        expect(response.status).to.be.equal(403)
        expect(response.body.message).to.be.contain('You cannot consume this service')
      })
    })
  })
})