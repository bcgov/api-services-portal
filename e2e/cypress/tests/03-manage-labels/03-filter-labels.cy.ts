import ConsumersPage from '../../pageObjects/consumers'
import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import ProductPage from '../../pageObjects/products'

describe('Filter Manage labels Spec', () => {
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
    // cy.visit(login.path)
  })


  it('authenticates Mark (Access-Manager)', () => {
    cy.get('@access-manager').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      home.useNamespace(namespace);
    })
  })

  it('verify that consumers are filters as per given parameter', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.get('@access-manager').then(({ labels_consumer1 }: any) => {
        cy.visit(consumers.path);
        consumers.verifyFilterResults('Products',product.name,'2')
        consumers.verifyFilterResults('Environment',product.environment.name,'2')
        consumers.verifyFilterResults('Labels',Object.keys(labels_consumer1.labels)[0],'1',Object.values(labels_consumer1.labels)[0])
        consumers.verifyFilterResults('Labels',Object.keys(labels_consumer1.labels)[1],'1',Object.values(labels_consumer1.labels)[1])
        consumers.verifyFilterResults('Labels',Object.keys(labels_consumer1.labels)[2],'2',Object.values(labels_consumer1.labels)[2])
      })
    })
  })
})