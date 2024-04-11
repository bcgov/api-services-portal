import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import Products from '../../pageObjects/products'

describe('Verify Two Tiered Hidden', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  var nameSpace: string
  let userSession: any
  const home = new HomePage()
  const pd = new Products()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.get('@common-testdata').then(({ twoTieredHidden }: any) => {
      cy.getUserSessionTokenValue(twoTieredHidden.namespace, false).then((value) => {
        userSession = value
      })
    })
  })

  it('Check gwa config command to set environment', () => {
    var cleanedUrl = Cypress.env('BASE_URL').replace(/^http?:\/\//i, '')
    cy.executeCliCommand('gwa config set --host ' + cleanedUrl + ' --scheme http').then(
      (response) => {
        expect(response.stdout).to.contain('Config settings saved')
      }
    )
  })

  it('Check gwa config command to set token', () => {
    cy.executeCliCommand('gwa config set --token ' + userSession).then((response) => {
      expect(response.stdout).to.contain('Config settings saved')
    })
  })

  it('create namespace with cli', () => {
    cy.get('@common-testdata').then(({ twoTieredHidden }: any) => {
      cy.executeCliCommand(
        'gwa namespace create --name ' +
          twoTieredHidden.namespace +
          ' --description="Two Tiered Hidden"'
      ).then((response) => {
        expect(response.stdout).to.contain(twoTieredHidden.namespace)
      })
    })
  })

  it('Upload config for key-auth', () => {
    cy.executeCliCommand('gwa apply -i ./cypress/fixtures/tthidden-key-auth.yml').then((response) => {
      expect(response.stdout).to.contain('Gateway Services published');
    })
  })

  it('Activates the namespace', () => {
    cy.getUserSession().then(() => {
      cy.get('@common-testdata').then(({ twoTieredHidden }: any) => {
        nameSpace = twoTieredHidden.namespace
        home.useNamespace(twoTieredHidden.namespace)
        cy.get('@login').then(function (xhr: any) {
          userSession = xhr.response.headers['x-auth-request-access-token']
        })
      })
    })
  })

  it('Verify that product is formatted correctly in public directory', () => {
    cy.visit(apiDir.path)
    cy.get('@apiowner').then(({ twoTieredHidden }: any) => {
      let product = twoTieredHidden.product
      apiDir.selectProduct(product.serviceName)
      apiDir.checkProductIcon(product.name, 'RiEarthFill')
      apiDir.checkTwoTieredHiddenButton()
    })
  })

  it('Verify that product is formatted correctly in your products page', () => {
    cy.visit(apiDir.path)
    apiDir.navigateToYourProduct()
    cy.get('@apiowner').then(({ twoTieredHidden }: any) => {
      let product = twoTieredHidden.product
      apiDir.selectProduct(product.serviceName)
      apiDir.checkProductIcon(product.name, 'RiEarthFill')
      apiDir.checkTwoTieredHiddenButton()
    })
  })

  it('Upload config for jwt-keycloak', () => {
    cy.executeCliCommand('gwa apply -i ./cypress/fixtures/tthidden-jwt.yml').then((response) => {
      expect(response.stdout).to.contain('Gateway Services published');
    })
  })

  it('Verify that product is formatted correctly in public directory', () => {
    cy.visit(apiDir.path)
    cy.get('@apiowner').then(({ twoTieredHidden }: any) => {
      let product = twoTieredHidden.product
      apiDir.selectProduct(product.serviceName)
      apiDir.checkProductIcon(product.name, 'RiEarthFill')
      apiDir.checkTwoTieredHiddenButton()
    })
  })

  it('Verify that product is formatted correctly in your products page', () => {
    cy.visit(apiDir.path)
    apiDir.navigateToYourProduct()
    cy.get('@apiowner').then(({ twoTieredHidden }: any) => {
      let product = twoTieredHidden.product
      apiDir.selectProduct(product.serviceName)
      apiDir.checkProductIcon(product.name, 'RiEarthFill')
      apiDir.checkTwoTieredHiddenButton()
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})
