import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'

describe('Create API Spec', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.visit(login.path)
  })

  it('authenticates api owner', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('creates and activates new namespace', () => {
    cy.get('@apiowner').then(({ namespace }: any) => {
      home.createNamespace(namespace)
    })
  })

  it('grant namespace access to access manager(Mark)', () => {
    cy.get('@apiowner').then(({ permission }: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission(permission.Mark)
    })
  })

  it('Grant CredentialIssuer.Admin permission to API Owner (awsummer)', () => {
    cy.get('@apiowner').then(({ user, namespaceAccessPermissions }: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission({userName: user.credentials.username, accessRole: namespaceAccessPermissions})
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
