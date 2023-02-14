import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import ConsumersPage from '../../pageObjects/consumers'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'

describe('Delete application which has approved request spec', () => {
  const login = new LoginPage()
  const app = new ApplicationPage()
  const apiDir = new ApiDirectoryPage()
  const myAccessPage = new MyAccessPage()


  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
  })

  it('authenticates Harley (developer)', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('creates an application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ deleteApplication }: any) => {
      app.createApplication(deleteApplication.approvedRequest)
    })
  })

  it('creates an access request', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ product, deleteApplication, accessRequest }: any) => {
      apiDir.createAccessRequest(product, deleteApplication.approvedRequest, accessRequest)
      myAccessPage.clickOnGenerateSecretButton()
      cy.contains("API Key").should('be.visible')
      myAccessPage.saveAPIKeyValue()
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Approve Pending Request Spec', () => {
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

  it('verify the request details', () => {
    cy.visit(consumers.path);
    consumers.reviewThePendingRequest()
  })

  it('approves an access request', () => {
    consumers.approvePendingRequest()
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Delete application which has approved request spec', () => {
  const login = new LoginPage()
  const app = new ApplicationPage()
  const apiDir = new ApiDirectoryPage()
  const myAccessPage = new MyAccessPage()


  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    cy.fixture('apiowner').as('apiowner')
  })

  it('authenticates Harley (developer)', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Delete application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ deleteApplication }: any) => {
      app.deleteApplication(deleteApplication.approvedRequest.name)
    })
  })

  it('Verify that application is deleted', () => {
    cy.get('@developer').then(({ deleteApplication }: any) => {
      cy.verifyToastMessage("Application delete")
      app.checkDeletedApplication(deleteApplication.approvedRequest.name)
    })
  })

  it('Verify that API is not accessible with the generated API Key when the application is deleted', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
        expect(response.status).to.be.equal(401)
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
