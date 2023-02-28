import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
import MyProfilePage from '../../pageObjects/myProfile'
import ConsumersPage from '../../pageObjects/consumers'

describe('Grant Access Manager Role', () => {
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

  it('Grant "Access.Manager" access to Mark (access manager)', () => {
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission(checkPermission.grantPermission.Mark)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Verify that Mark is able to view the pending request', () => {

  const login = new LoginPage()
  const home = new HomePage()
  const consumers = new ConsumersPage()
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

  it('Authenticates Mark (Access-Manager)', () => {
    cy.get('@access-manager').then(({ user, checkPermission }: any) => {
      cy.visit(login.path)
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
      home.useNamespace(checkPermission.namespace)
      cy.visit(mp.path)
    })
  })

  it('Navigate to Consumer Page to see the Approve Request option', ()=> {
    cy.visit(consumers.path)
  })

  it('Verify that the option to approve request is displayed', ()=> {
      consumers.isApproveAccessEnabled(true)
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
    cy.resetCredential('Mark')
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})