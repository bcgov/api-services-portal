import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import Products from '../../pageObjects/products'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'

describe('Create API Spec', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const sa = new ServiceAccountsPage()
  const pd = new Products()
  let userSession: any
  let namespace: any

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload(true)
    cy.resetState()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('api-v2').as('api')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.get('@common-testdata').then(({ apiTest }: any) => {
      cy.getUserSessionTokenValue(apiTest.namespace, false).then((value) => {
        userSession = value
      })
    })
  })

  it('create namespace', () => {
    cy.createGateway().then((response) => {
      namespace = response.gatewayId
      cy.log('New namespace created: ' + namespace)
      cy.updateJsonValue('common-testdata.json', 'apiTest.namespace', namespace)
      cy.updateJsonValue('api-v2.json', 'organization.expectedNamespace.name', namespace)
    });
  })

  it('activates new namespace', () => {
    cy.activateGateway(namespace)
  })

  it('Associate Namespace to the organization Unit', () => {
    cy.get('@api').then(({ organization }: any) => {
      cy.setHeaders(organization.headers)
      cy.setAuthorizationToken(userSession)
      cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/' + organization.orgExpectedList.name + '/namespaces/' + namespace, 'PUT').then((response:any) => {
        expect(response.apiRes.status).to.be.equal(200)
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({log:true})
  })
})
