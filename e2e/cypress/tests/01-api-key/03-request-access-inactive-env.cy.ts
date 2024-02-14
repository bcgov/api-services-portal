import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
import Products from '../../pageObjects/products'
import MyAccessPage from '../../pageObjects/myAccess'

describe('Change an Active environment to Inactive', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()
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
    // cy.visit(login.path)
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ namespace }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        cy.log('Logged in!')
        home.useNamespace(namespace)
      })
    })
  })

  it('Navigate to Products Page', () => {
    cy.visit(pd.path)
  })

  it('Change the current active environment to inactive state', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      pd.editProductEnvironment(product.name, product.environment.name)
      pd.editProductEnvironmentConfig(product.environment.config, true)
    })
  })

  after(() => {
    cy.logout()
  })
})

describe('Verify enactive environment in rrequest access pop up', () => {
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const myAccessPage = new MyAccessPage()

  before(() => {
    cy.visit('/')
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    Cypress.session.clearAllSavedSessions()
    // cy.visit(login.path)
  })

  it('authenticates Harley (developer)', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('creates an application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ application }: any) => {
      app.createApplication(application)
    })
  })

  it('Verify that inactive environment is not displayed', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ product, application }: any) => {
      apiDir.checkInactiveEnvironmentAccessReqOption(product, application)
    })
  })

  it('Close the popup by click on Cancel button', () => {
    myAccessPage.cancelRequestAccessPopUp()
  })

  after(() => {
    cy.logout()
    // cy.clearLocalStorage({ log: true })
    // cy.deleteAllCookies()
    // Cypress.session.clearAllSavedSessions()
    // cy.clearCookie('_oauth2_proxy')
    // cy.clearCookie('keystone.sid')
    // debugger
  })
})

describe('Change an the environment back to active', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()
  const pd = new Products()

  before(() => {
    debugger
    // cy.clearAllSessionStorage({log: true})
    cy.visit('/')
    // cy.deleteAllCookies()
    // cy.clearCookies()
    // cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    // cy.visit(login.path)
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ namespace }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        cy.log('Logged in!')
        home.useNamespace(namespace)
      })
    })
  })

  it('Navigate to Products Page', () => {
    debugger
    cy.visit(pd.path)
  })

  it('Change the environment back to active state', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      pd.editProductEnvironment(product.name, product.environment.name)
      pd.editProductEnvironmentConfig(product.environment.config)
    })
  })

  after(() => {
    cy.logout()
    // cy.clearLocalStorage({ log: true })
    // cy.deleteAllCookies()
  })
})