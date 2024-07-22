import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'


describe('Grant appropriate permissions to team members for client credential flow', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()
  let userSession: any
  let namespace: string

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      cy.getUserSessionTokenValue(clientCredentials.namespace, false).then((value) => {
        userSession = value
      })
    })
  })

  it('Create new namespace and activate it', () => {
    cy.createGateway().then((response) => {
      namespace = response.gatewayId
      cy.log('New namespace created: ' + namespace)
      cy.replaceWordInJsonObject('ccplatform', namespace, 'cc-service-gwa.yml')
      cy.updateJsonValue('common-testdata.json', 'clientCredentials.namespace', namespace)
      cy.updateJsonValue('apiowner.json', 'clientCredentials.namespace', namespace)
      cy.activateGateway(namespace)
    })
  })

  it('Grant namespace access to access manager(Mark)', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission(clientCredentials.Mark)
    })
  })

  it('Grant CredentialIssuer.Admin permission to credential issuer(Wendy)', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission(clientCredentials.Wendy)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
