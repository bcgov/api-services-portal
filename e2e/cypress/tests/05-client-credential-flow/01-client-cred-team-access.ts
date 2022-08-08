import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'


describe('Grant appropriate permissions to team members for client credential flow', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
    cy.resetState()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.visit(login.path)
  })

  it('Authenticates api owner', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Creates and activates new namespace', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      home.createNamespace(clientCredentials.namespace)
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
