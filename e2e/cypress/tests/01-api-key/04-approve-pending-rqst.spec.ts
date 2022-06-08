import ConsumersPage from '../../pageObjects/consumers'
import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'

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
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/store').as('store')
    cy.visit(login.path)
  })

  it('Verify that API is not accessible with the generated API Key when the request is not approved', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
        expect(response.status).to.be.equal(403)
        expect(response.body.message).to.be.contain('You cannot consume this service')
      })
    })
  })

  it('authenticates Mark (Access-Manager)', () => {
    cy.get('@access-manager').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      home.useNamespace(namespace);
    })
  })

  it('approves an access request', () => {
    cy.visit(consumers.path);
    cy.contains('Review').click()
    cy.contains('Approve').click()
    cy.contains('span', 'Complete', { timeout: 10000 }).should('be.visible');
  })

  it('Verify that API is accessible with the generated API Key', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
        cy.log(response)
        expect(response.status).to.be.equal(200)
      })
    })
  })
})

describe('Turn off the Authentication', () => {
  const consumers = new ConsumersPage()

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('developer').as('developer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/store').as('store')
  })

  it('Turn off the authentication switch', () => {
    cy.visit(consumers.path);
    consumers.clickOnTheFirstConsumerID()
    consumers.turnOnACLSwitch(false)
  })

  it('Verify that API is not accessible with the generated API Key', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
        expect(response.status).to.be.equal(403)
        expect(response.body.message).to.be.contain('You cannot consume this service')
      })
    })
  })

  after(() => {
    consumers.turnOnACLSwitch(true)
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})