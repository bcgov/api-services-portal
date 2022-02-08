import ApiDirectoryPage from '../pageObjects/apiDirectory'
import ApplicationPage from '../pageObjects/applications'
import LoginPage from '../pageObjects/login'
import MyAccessPage from '../pageObjects/myAccess'
import HomePage from '../pageObjects/home'
import NamespaceAccessPage from '../pageObjects/namespaceAccess'
import ConsumersPage from '../pageObjects/consumers'

describe('Revoke Access Manager Role', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const myAccessPage = new MyAccessPage()
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
    cy.get('@apiowner').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
      home.useNamespace(namespace)
    })
  })

  it('revoke "Namespace.Manager" access to Mark (access manager)', () => {
    cy.get('@apiowner').then(({ revokePermission }: any) => {
      cy.visit(na.path)
      na.revokePermission(revokePermission.Mark)
    })
  })

  // after(() => {
  //   cy.logout()
  //   cy.clearLocalStorage({ log: true })
  //   cy.deleteAllCookies()
  // })
})

describe('Verify the grant pending request access', () => {

  const login = new LoginPage()
  const consumers = new ConsumersPage()
  const home = new HomePage()

  before(() => {
    cy.visit('/')
    // cy.clearCookies()
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.fixture('access-manager').as('access-manager')
    cy.visit(login.path)
  })

  it('Verify that the pending request does not display', () => {
    cy.get('@access-manager').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password).then(() => {
        cy.visit(consumers.path);
        home.useNamespace(namespace);
        consumers.checkApproveAccess();
      })
    })
  })

  // after(() => {
  //   cy.logout()
  //   cy.clearLocalStorage({ log: true })
  //   cy.deleteAllCookies()
  // })
})

describe('Grant the access back to Mark', () => {

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
    cy.get('@apiowner').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
      home.useNamespace(namespace)
    })
  })

  it('grant namespace access to Mark (access manager)', () => {
    cy.get('@apiowner').then(({ grantPermission }: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission(grantPermission.Mark)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})