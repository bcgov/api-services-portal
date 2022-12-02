import ConsumersPage from '../../pageObjects/consumers'
import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import ProductPage from '../../pageObjects/products'
import GatewayServicePage from '../../pageObjects/gatewayService'

describe('Filter Gateway Services Spec', () => {
  const login = new LoginPage()
  const consumers = new ConsumersPage()
  const home = new HomePage()
  const gs = new GatewayServicePage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
      home.useNamespace(namespace)
    })
  })

  it('Navigate to Gateway Service Page', () => {
    cy.visit(gs.path)
    cy.wait(2000)
  })

  it('verify that Gateway service filters as per given parameter', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      gs.verifyFilterResultsForGatewayService('Products', product.name, '2')
      gs.verifyFilterResultsForGatewayService('Environments', product.environment.name, '1')
      gs.verifyFilterResultsForGatewayService('Environments', product.test_environment.name, '1')
    })
  })
})