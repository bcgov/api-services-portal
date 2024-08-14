import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NameSpacePage from '../../pageObjects/namespace'
import Products from '../../pageObjects/products'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'

const cleanedUrl = Cypress.env('BASE_URL').replace(/^http?:\/\//i, "");

describe('Delete created resources', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const sa = new ServiceAccountsPage()
  const pd = new Products()
  const ns = new NameSpacePage
  let flag: boolean
  let userSession: any

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
        cy.getUserSessionTokenValue(deleteResources.namespace, false).then((value) => {
          userSession = value
        })
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

  it('Set token with gwa config command', () => {
    cy.exec('gwa config set --token ' + userSession, { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
      expect(response.stdout).to.contain("Config settings saved")
    });
  })

  it('Set environment with gwa config command', () => {
    cy.executeCliCommand('gwa config set --host ' + cleanedUrl + ' --scheme http').then((response) => {
      expect(response.stdout).to.contain("Config settings saved")
    });
  })

  it('Delete Namespace (CLI)', () => {
    cy.get('@common-testdata').then(({ deleteResources }: any) => {
      cy.deleteGatewayCli(deleteResources.namespace, true)
    });
  });
  
  it('Verify that namespace is no longer available', () => {
    cy.get('@common-testdata').then(({ deleteResources }: any) => {
      cy.visit('/')
      cy.wrap(null).then(() => {
        return cy.getGateways();
      }).then((result) => {
        const namespaceNames = result.map((ns: { name: any }) => ns.name);
        expect(namespaceNames).to.not.include(deleteResources.namespace);
      });
    });
  });

  it('Verify delete namespace works from the UI', () => {
    cy.createGateway().then((response) => {
      const namespace = response.gatewayId
      cy.log('New namespace created: ' + namespace)
      cy.activateGateway(namespace);
      cy.visit(ns.detailPath)
      ns.deleteNamespace(namespace)

      cy.visit('/')
      cy.wrap(null).then(() => {
        return cy.getGateways();
      }).then((result) => {
        const namespaceNames = result.map((ns: { name: any }) => ns.name);
        expect(namespaceNames).to.not.include(namespace);
      });
    });
  });

  after(() => {
    cy.logout()

  })
})
