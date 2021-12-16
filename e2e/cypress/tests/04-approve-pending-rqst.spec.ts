import ApiDirectoryPage from '../pageObjects/apiDirectory'
import ConsumersPage from '../pageObjects/consumers'
import LoginPage from '../pageObjects/login'
import ApplicationPage from '../pageObjects/applications'
import HomePage from '../pageObjects/home'

describe('Approve Pending Request Spec', () => {
  const login = new LoginPage()
  const consumers = new ConsumersPage()
  const app = new ApplicationPage()
  const apiDir = new ApiDirectoryPage()
  const home = new HomePage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('developer').as('developer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/store').as('store')
    cy.visit(login.path)
  })

  it('approves an access request', () => {
    cy.get('@access-manager').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password).then(() => {
        cy.visit(consumers.path);
        home.useNamespace(namespace);
        cy.contains('Review').click()
        cy.contains('Approve').click()
        cy.contains('span','Complete', { timeout: 10000 }).should('be.visible');
      })
    })
  })

  it('Verify that API is accessible with the generated API Key', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.makeKongRequest(product.environment.config.serviceName,'GET').then((response) => {
        cy.log(response)
        expect(response.status).to.be.equal(200)
    })
  })
})

  after(() => {
    cy.logout()
    cy.clearLocalStorage({log:true})
    cy.deleteAllCookies()
  })
})
