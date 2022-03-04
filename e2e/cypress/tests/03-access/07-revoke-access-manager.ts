import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import MyProfilePage from '../../pageObjects/myProfile'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
import ConsumersPage from '../../pageObjects/consumers'


describe('Revoke Credential Issuer Role to Mark', () => {
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

  it('revoke "Access.Manage" access and only assign "Namespace.View" permission to Mark', () => {
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission(checkPermission.grantPermission.Mark)
      na.revokePermission(checkPermission.revokePermission.Mark_AM)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Verify that Mark is unable to approve pending request', () => {

  const login = new LoginPage()
  const home = new HomePage()
  const mp = new MyProfilePage()
  const consumers = new ConsumersPage()
  const na = new NamespaceAccessPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('credential-issuer').as('credential-issuer')
    cy.fixture('access-manager').as('access-manager')
  })

  it('authenticates Mark', () => {
    cy.get('@access-manager').then(({ user, checkPermission }: any) => {
      cy.visit(login.path)
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
      home.useNamespace(checkPermission.namespace)
      cy.visit(mp.path)
    })
  })

  it('Verify that only "Namespace.View" permission is displayed in the profile', () => {
    mp.checkScopeOfProfile("Namespace.View")
  })

  it('Navigate to Consumer Page to see the Approve Request option', ()=> {
    cy.visit(consumers.path)
  })

  it('Verify that the option to approve request is not displayed', ()=> {
      consumers.isApproveAccessEnabled(false)
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})