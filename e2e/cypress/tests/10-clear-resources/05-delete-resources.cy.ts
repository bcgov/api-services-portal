import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NameSpacePage from '../../pageObjects/namespace'
import Products from '../../pageObjects/products'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'

describe('Delete created resources', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const sa = new ServiceAccountsPage()
  const pd = new Products()
  const ns = new NameSpacePage
  let flag: boolean

  before(() => {
    cy.visit('/')
    cy.reload()
    // cy.resetState()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ deleteResources }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        cy.activateGateway(deleteResources.namespace);
      })
    })
  })

  it('Navigates to Product page', () => {
    cy.visit(pd.path)
  })

  it('Delete Product Environment', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ deleteResources }: any) => {
      pd.deleteProductEnvironment(deleteResources.product.name, deleteResources.product.environment.name)
    })
  })

  it('Delete the Product', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ deleteResources }: any) => {
      pd.deleteProduct(deleteResources.product.name)
    })
  })

  it('Delete Service Accounts', () => {
    cy.visit(sa.path)
    sa.deleteAllServiceAccounts()
  })

  it('Delete Namespace', () => {
    cy.get('@common-testdata').then(({ deleteResources }: any) => {
      cy.visit(ns.detailPath)
      ns.deleteNamespace(deleteResources.namespace)
    });
  });
  
  it('Verify that namespace is no longer available', () => {
    cy.get('@common-testdata').then(({ deleteResources }: any) => {
      cy.wrap(null).then(() => {
        return cy.getGateways();
      }).then((result) => {
        console.log(result);
        const namespaceNames = result.map((ns: { name: any }) => ns.name);
        console.log(namespaceNames);
        expect(namespaceNames).to.not.include(deleteResources.namespace);
      });
    });
  });

  after(() => {
    cy.logout()

  })
})
