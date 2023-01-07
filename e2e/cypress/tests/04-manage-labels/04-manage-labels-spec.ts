import ConsumersPage from '../../pageObjects/consumers'
import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import ProductPage from '../../pageObjects/products'

describe('Manage/Edit labels spec', () => {
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
    cy.fixture('developer').as('developer')
    cy.fixture('state/store').as('store')
  })

  it('authenticates Mark (Access-Manager)', () => {
    cy.get('@access-manager').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      home.useNamespace(namespace);
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

  it('Verify that labels can be deleted', () => {
    consumers.deleteManageLabels()
  })

  it('Verify that labels can be updated', () => {
    consumers.updateManageLabels()
  })

  it('Verify that labels can be added', () => {
    consumers.addManageLabels()
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
    cy.wait(100000)
})
})