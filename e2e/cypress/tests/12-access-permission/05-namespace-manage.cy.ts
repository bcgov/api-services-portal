import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import NameSpacePage from '../../pageObjects/namespace'
import ToolBar from '../../pageObjects/toolbar'
import AuthorizationProfile from '../../pageObjects/authProfile'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
import { slowCypressDown } from 'cypress-slow-down'

describe('Grant Namespace Manage Role', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()

  before(() => {
    cy.visit('/')
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

  it('Grant only "Gateway.Manage" permission to Wendy', () => {
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      cy.visit(na.path)
      // na.revokeAllPermission('wendy@idir')
      // na.revokePermission(checkPermission.revokePermission.Wendy_ci)
      // na.clickGrantUserAccessButton()
      // na.grantPermission(checkPermission.grantPermission.Wendy)
      na.editPermission(checkPermission.grantPermission.Wendy_NM)
    })
  })

  after(() => {
    cy.logout()
  })
})

describe('Verify that Wendy is able to see all the options for the Namespace', () => {

  const login = new LoginPage()
  const home = new HomePage()
  const ns = new NameSpacePage()
  const tb = new ToolBar()
  const authProfile = new AuthorizationProfile()

  before(() => {
    cy.visit('/')
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('credential-issuer').as('credential-issuer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
  })

  it('Authenticates Wendy (Credential-Issuer)', () => {
    cy.get('@credential-issuer').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ checkPermission }: any) => {
        cy.visit(login.path)
        cy.login(user.credentials.username, user.credentials.password)
        cy.log('Logged in!')
        cy.activateGateway(checkPermission.namespace)
      })
    })
  })

  it('Verify that all the namespace options and activities are displayed', () => {
    cy.visit(ns.path)
    ns.verifyThatAllOptionsAreDisplayed()
  })

  after(() => {
    cy.logout()
    cy.resetCredential('Wendy')
    cy.logout()
  })
})
