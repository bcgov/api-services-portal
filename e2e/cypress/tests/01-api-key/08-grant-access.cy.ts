import ConsumersPage from '../../pageObjects/consumers'
import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import ProductPage from '../../pageObjects/products'

describe('Grant Access Spec', () => {
  const login = new LoginPage()
  const consumers = new ConsumersPage()
  const home = new HomePage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('developer').as('developer')
    cy.fixture('state/store').as('store')
    cy.fixture('common-testdata').as('common-testdata')
  })

  it('authenticates Mark (Access-Manager)', () => {
    cy.get('@common-testdata').then(({ namespace }: any) => {
      cy.get('@access-manager').then(({ user }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        cy.activateGateway(namespace);
      })
    })
  })

  it('Navigate to Consumer page and filter the product', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.visit(consumers.path);
      consumers.filterConsumerByTypeAndValue('Products', product.name)
    })
  })

  it('Click on the first consumer', () => {
    consumers.clickOnTheFirstConsumerID()
  })

  it('Click on Grant Access button', () => {
    cy.wait(1000)
    consumers.clickOnGrantAccessBtn()
  })

  it('Grant Access to Test environment', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      consumers.grantAccessToGivenProductEnvironment(product.name, product.test_environment.name)
    })
  })

  it('Verify that API is accessible with the generated API Key for Test environment', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.makeKongRequest(product.test_environment.config.serviceName, 'GET').then((response) => {
        cy.log(response)
        expect(response.status).to.be.equal(200)
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})