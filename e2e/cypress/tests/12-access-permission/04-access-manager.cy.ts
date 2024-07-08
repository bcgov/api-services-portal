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
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ checkPermission }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
      cy.activateGateway(checkPermission.namespace)
    })
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
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
  })

  it('Authenticates Mark (Access-Manager)', () => {
    cy.get('@access-manager').then(({ user }: any) => {
      cy.get('@common-testdata').then(({checkPermission}: any) => {
        cy.visit(login.path)
        cy.login(user.credentials.username, user.credentials.password)
        cy.log('Logged in!')
        cy.activateGateway(checkPermission.namespace)
        cy.visit(mp.path)
      })
    })
  })

  it('Navigate to Consumer Page to see the Approve Request option', () => {
    cy.visit(consumers.path)
  })

  it('Verify that the option to approve request is displayed', () => {
    consumers.isApproveAccessEnabled(true)
  })

  after(() => {
    cy.logout()
    cy.resetCredential('Mark')
    cy.logout()
  })
})