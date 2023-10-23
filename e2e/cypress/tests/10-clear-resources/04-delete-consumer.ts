import ConsumersPage from '../../pageObjects/consumers'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NameSpacePage from '../../pageObjects/namespace'
import Products from '../../pageObjects/products'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'

describe('Delete created consumer', () => {
  const home = new HomePage()
  const sa = new ServiceAccountsPage()
  const pd = new Products()
  const ns = new NameSpacePage
  const consumers = new ConsumersPage()
  let flag: boolean
  let consumerID: any

  before(() => {
    cy.visit('/')
    cy.reload()
    // cy.resetState()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('apiowner').as('apiowner')
  })

  it('authenticates Mark (access manager)', () => {
    cy.get('@access-manager').then(({ user }: any) => {
      cy.get('@apiowner').then(({ deleteResources }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        home.useNamespace(deleteResources.namespace);
      })
    })
  })

  it('Navigates to Consumer page', () => {
    cy.visit(consumers.path)
  })

  it('Get the consumer ID from the list', () => {
    cy.getLastConsumerID().then((title) => {
      consumerID = title
    })
  })

  it('Delete the consumer ID from the list', () => {
    consumers.deleteConsumer(consumerID)
  })

  it('Verify toast message for consumer deletion', () => {
    cy.verifyToastMessage("Consumer deleted")
  })

  after(() => {
    cy.logout()

  })
})
