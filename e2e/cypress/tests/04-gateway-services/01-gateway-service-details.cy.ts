import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import GatewayServicePage from '../../pageObjects/gatewayService'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'

describe('Verify Gateway Service details', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const myAccessPage = new MyAccessPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()
  const gs = new GatewayServicePage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
      home.useNamespace(namespace)
    })
  })

  it('Navigate to Gateway Service Page', () => {
    cy.intercept('POST', '/gql/api').as('createBoard')
    cy.visit(gs.path)
    cy.wait(2000)
  })

  it('Expand Gateway service details pane', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      gs.expandServiceDetails(product.environment.config.serviceName, product.environment.name)
    })
  })

  it('Verify total requests counts', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      gs.verifyRequestCount(product.environment.config.serviceName, product.environment.name, 0)
    })
  })

  it('Verify the routes details ', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      gs.verifyRouteName(product.environment.config.serviceName, 'https://a-service-for-newplatform.api.gov.bc.ca/')
    })
  })

  it('Verify the host details ', () => {
    gs.verifyHostName('httpbin.org')
  })

  it('Verify the Tags details ', () => {
    gs.verifyTagsName('ns.newplatform')
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
