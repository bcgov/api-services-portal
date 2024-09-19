import ConsumersPage from '../../pageObjects/consumers'
import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import ProductPage from '../../pageObjects/products'
import GatewayServicePage from '../../pageObjects/gatewayService'
import Products from '../../pageObjects/products'

describe('Filter Gateway Services Spec', () => {
  const login = new LoginPage()
  const consumers = new ConsumersPage()
  const home = new HomePage()
  const gs = new GatewayServicePage()
  const pd = new Products()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.get('@apiowner').then(({ namespace }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        cy.log('Logged in!')
        cy.activateGateway(namespace)
      })
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

  it('Change Product environment from active to inactive', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.editProductEnvironment(product.name, product.test_environment.name)
      cy.get('@apiowner').then(({ product }: any) => {
        pd.editProductEnvironmentConfig(product.test_environment.config, true)
      })
    })
  })

  it('Navigate to Gateway Service Page', () => {
    cy.visit(gs.path)
    cy.wait(2000)
  })

  it('verify that Gateway service filters as per given parameter', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      gs.verifyFilterResultsForGatewayService('State', "Active", '1')
      gs.verifyFilterResultsForGatewayService('State', "Inactive", '1')
    })
  })

  it('Change Product environment from inactive to active', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.editProductEnvironment(product.name, product.test_environment.name)
      cy.get('@apiowner').then(({ product }: any) => {
        pd.editProductEnvironmentConfig(product.test_environment.config)
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})