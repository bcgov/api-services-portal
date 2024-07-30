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
    cy.get('@access-manager').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ namespace }: any) => {
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
  })
})