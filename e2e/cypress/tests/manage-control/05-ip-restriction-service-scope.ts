import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import ConsumersPage from '../../pageObjects/consumers'

describe('Manage Control-IP Restriction Spec - Service as Scope', () => {
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

  it('set IP address that is not accessible in the network as allowed IP and set service as scope', () => {
    cy.get('@access-manager').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password).then(() => {
        home.useNamespace(namespace);
        cy.visit(consumers.path);
        consumers.clickOnTheFirstConsumerID()
        consumers.setAllowedIPAddress('127.0.0.2','Route')
      })
    })
  })

  it('verify IP Restriction error when the API calls other than the allowed IP', () => {
    cy.get('@apiowner').then(({ product }: any) => {
        cy.makeKongRequest(product.environment.config.serviceName,'GET').then((response) => {
          expect(response.status).to.be.equal(403)
          expect(response.body.message).to.be.contain('Your IP address is not allowed')
      })
    })
  })

  it('set IP address that is accessible in the network as allowed IP and set service as scope', () => {
    cy.get('@access-manager').then(({ user, namespace }: any) => {
      cy.visit(consumers.path);
      consumers.clickOnTheFirstConsumerID()  
      consumers.setAllowedIPAddress('192.168.0.1/0')
    })
  })

  it('verify the success stats when the API calls within the allowed IP range', () => {
    cy.get('@apiowner').then(({ product }: any) => {
        cy.makeKongRequest(product.environment.config.serviceName,'GET').then((response) => {
          expect(response.status).to.be.equal(200)
      })
    })
  })

})

