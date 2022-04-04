import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import Products from '../../pageObjects/products'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'

describe('Delete created resources', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const sa = new ServiceAccountsPage()
  const pd = new Products()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
    cy.resetState()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    // cy.visit(login.path)
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user, deleteResources }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      home.useNamespace(deleteResources.namespace);
    })
  })

  it('Navigates to Product page', () => {
    cy.visit(pd.path)
    cy.wait(3000)
  })

  it('Delete Product Environment', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      // cy.visit(pd.path)
      pd.deleteProductEnvironment(product.name, product.environment.name)
    })
  })

  it('Delete the Product', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      pd.deleteProduct(product.name)
    })
  })

  it('Navigates to Service Account Page', () => {
    cy.visit(sa.path)
  })

  it('Delete Service Accounts', () => {
    sa.deleteAllServiceAccounts()
  })

  it('Delete Namespace', () => {
    cy.get('@apiowner').then(({ deleteResources }: any) => {
      home.deleteNamespace(deleteResources.namespace)
    })
  })
})
