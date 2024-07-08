import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import Products from '../../pageObjects/products'

describe('Verify Protected Externally Auth', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  var nameSpace: string
  let userSession: string
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
    cy.fixture('state/regen').as('regen')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('Authenticates api owner', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })
  it('Activates the namespace', () => {
    cy.getUserSession().then(() => {
      cy.get('@common-testdata').then(({ clientCredentials }: any) => {
        nameSpace = clientCredentials.namespace
        cy.activateGateway(clientCredentials.namespace)
        cy.get('@login').then(function (xhr: any) {
          userSession = xhr.response.headers['x-auth-request-access-token']
        })
      })
    })
  })

  it('Creates a new product in the directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ protectedExternally }: any) => {
      pd.createNewProduct(
        protectedExternally.protectedExternally_initial.product.name,
        protectedExternally.protectedExternally_initial.product.environment.name
      )
    })
  })

  it('Assign a dataset to the product', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ protectedExternally }: any) => {
      let product = protectedExternally.protectedExternally_initial.product
      pd.updateDatasetNameToCatelogue(product.name, product.environment.name)
    })
  })

  it('Update the authorization scope from Public to Protected Externally', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ protectedExternally }: any) => {
      let product = protectedExternally.protectedExternally_external.product
      pd.editProductEnvironment(product.name, product.environment.name)
      pd.editProductEnvironmentConfig(product.environment.config)
    })
  })
  
  it('Verify that product is w/o a request button in API Directory', () => {
    cy.visit(apiDir.path)
    cy.get('@apiowner').then(({ protectedExternally }: any) => {
      let product = protectedExternally.protectedExternally_external.product
      apiDir.selectProduct(product.name)
      cy.get(apiDir.rqstAccessBtn).should('not.exist')
      apiDir.checkProductIcon(product.name, 'FaLock')
    })
  })

  it('Delete the Product', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ protectedExternally }: any) => {
      pd.deleteProduct(protectedExternally.protectedExternally_external.product.name)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})
