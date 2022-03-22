import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'
import NameSpacePage from '../../pageObjects/namespace'
import ToolBar from '../../pageObjects/toolbar'
import MyProfilePage from '../../pageObjects/myProfile'

describe('Revoke Access Manager Role', () => {
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

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user, checkPermission }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
      home.useNamespace(checkPermission.namespace)
    })
  })

  it('revoke "Namespace.View" access to Mark (access manager)', () => {
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      cy.visit(na.path)
      na.revokePermission(checkPermission.revokePermission.Mark)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Verify that Mark is unable to view the Namespace', () => {

  const login = new LoginPage()
  const home = new HomePage()
  const sa = new ServiceAccountsPage()
  const mp = new MyProfilePage()
  const na = new NamespaceAccessPage()


  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
  })

  it('authenticates Mark (Access-Manager)', () => {
    cy.get('@access-manager').then(({ user, checkPermission }: any) => {
      cy.visit(login.path)
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
      home.useNamespace(checkPermission.namespace)
      cy.visit(mp.path)
    })
  })

  it('Verify that only "Access.Manager" permission is displayed in the profile', () => {
      mp.checkScopeOfProfile("Access.Manage")
  })

  it('Verify that Service Account option does not display', () => {
    cy.visit(na.path)
    sa.checkServiceAccountNotExist()
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})