import ConsumersPage from '../../pageObjects/consumers'
import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import ProductPage from '../../pageObjects/products'

describe('Link Consumers to Namespace', () => {
  const login = new LoginPage()
  const consumers = new ConsumersPage()
  const home = new HomePage()
  let consumerID: any

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
    // cy.visit(login.path)
  })

  it('authenticates Mark (Access-Manager)', () => {
    cy.get('@access-manager').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      home.useNamespace(namespace);
    })
  })

  it('Navigate to Consumer Page', () => {
    cy.visit(consumers.path);
    cy.wait(5000)
  })

  it('Get the consumer ID from the list', () => {
      cy.getLastConsumerID().then((title)=>{
        consumerID = title
      })
      // cy.wrap(consumers).its('inputValue').then(inputValue => {
      //   consumerID = inputValue.text()
      // })
  })

  it('Delete the consumer ID from the list', () => {
    consumers.deleteConsumer(consumerID)
  })

  it('Click on "Link Consumers to Namespace" button', () => {
    consumers.clickOnLinkConsumerToNamespaceBtn()
  })

  it('Link the delete consumer to the Namespace', () => {
    consumers.linkTheConsumerToNamespace(consumerID)
    cy.wait(2000)
  })

  it('Verify that the consumer is linked to the namespace', () => {
    cy.getLastConsumerID().then((title)=>{
      expect(title).to.equal(consumerID)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})