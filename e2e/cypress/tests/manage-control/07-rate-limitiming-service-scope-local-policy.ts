import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import ConsumersPage from '../../pageObjects/consumers'

describe('Manage Control-Rate Limiting Spec for Service as Scope and Local Policy', () => {
  const login = new LoginPage()
  const home = new HomePage()
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
    cy.visit(login.path)
  })

  it('Manage Control-Rate Limiting Spec for Service as Scope and Local Policy', () => {
    cy.get('@access-manager').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password).then(() => {
        home.useNamespace(namespace);
        cy.visit(consumers.path);
        consumers.clickOnTheFirstConsumerID()
        consumers.setRateLimiting('1')
      })
    })
  })

  it('verify rate limit error when the API calls beyond the limit', () => {
    cy.get('@apiowner').then(({ product }: any) => {
        debugger
        cy.makeKongRequest(product.environment.config.serviceName,'GET').then((response) => {
          expect(response.status).to.be.equal(200)
      })
      cy.makeKongRequest(product.environment.config.serviceName,'GET').then((response) => {
        expect(response.status).to.be.equal(429)
        debugger
        expect(response.body.message).to.be.contain('API rate limit exceeded')
    })
    })
  })
})

