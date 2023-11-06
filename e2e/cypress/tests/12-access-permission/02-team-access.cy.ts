import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'

describe('Team Access Spec', () => {
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
    cy.fixture('common-testdata').as('common-testdata')
    // cy.visit(login.path)
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ checkPermission }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        cy.log('Logged in!')
        home.useNamespace(checkPermission.namespace)
      })
    })
  })

  it('grant namespace access to Mark (access manager)', () => {
    cy.get('@apiowner').then((checkPermission: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission(checkPermission.grantPermission.Mark)
    })
  })

  it('Grant permission to Janis (API Owner)', () => {
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission(checkPermission.grantPermission.Janis)
    })
  })

  it('Grant permission to Wendy', () => {
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission(checkPermission.grantPermission.Wendy)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
