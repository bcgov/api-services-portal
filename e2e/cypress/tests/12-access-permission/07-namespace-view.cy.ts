import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import MyProfilePage from '../../pageObjects/myProfile'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
import ConsumersPage from '../../pageObjects/consumers'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'


describe('Grant Namespace View Role to Mark', () => {
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

  it('Authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ checkPermission }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        cy.log('Logged in!')
        cy.activateGateway(checkPermission.namespace)
      })
    })
  })

  it('Grant only "Gateway.View" permission to Mark', () => {
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      cy.visit(na.path)
      na.revokeAllPermission(checkPermission.grantPermission.Mark.userName)
      na.clickGrantUserAccessButton()
      na.grantPermission(checkPermission.grantPermission.Mark_NV)
    })
  })

  after(() => {
    cy.logout()
  })
})

describe('Verify that Mark is unable to create service account', () => {

  const login = new LoginPage()
  const home = new HomePage()
  const mp = new MyProfilePage()
  const consumers = new ConsumersPage()
  const sa = new ServiceAccountsPage()

  before(() => {
    cy.visit('/')
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('credential-issuer').as('credential-issuer')
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
  })

  it('authenticates Mark', () => {
    cy.get('@access-manager').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ checkPermission }: any) => {
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

  it('Verify that the option to approve request is not displayed', () => {
    consumers.isApproveAccessEnabled(false)
  })

  it('Navigate to Consumer Page to see the Approve Request option', () => {
    cy.visit(consumers.path)
  })

  it('Verify that service accounts are not created', () => {
    cy.visit(sa.path)
    cy.get('@access-manager').then(({ serviceAccount }: any) => {
      sa.createServiceAccount(serviceAccount.scopes)
      sa.isShareButtonVisible(true)
      cy.visit(consumers.path)
    })
  })

  after(() => {
    cy.logout()
    cy.resetCredential('Mark')
    cy.logout()
  })
})
