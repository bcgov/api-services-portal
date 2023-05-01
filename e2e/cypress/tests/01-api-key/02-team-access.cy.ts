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
    // cy.visit(login.path)
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      cy.log('Logged in!')
      home.useNamespace(namespace)
    })
  })

  it('Navigate to Namespace Access Page', () => {
    cy.visit(na.path)
    cy.wait(2000)
    cy.checkA11yIssue()
  })

  it('Grant namespace access to Mark (access manager)', () => {
    cy.get('@apiowner').then(({ grantPermission }: any) => {
      na.clickGrantUserAccessButton()
      na.grantPermission(grantPermission.Mark)
    })
  })

  // it('Grant CredentialIssuer.Admin permission to Janis (API Owner)', () => {
  //   cy.get('@apiowner').then(({ grantPermission }: any) => {
  //     na.clickGrantUserAccessButton()
  //     na.grantPermission(grantPermission.Janis)
  //   })
  // })

  it('Grant CredentialIssuer.Admin permission to Janis (API Owner)', () => {
    cy.get('@apiowner').then(({ grantPermission }: any) => {
      // na.clickGrantUserAccessButton()
      // na.grantPermission(grantPermission.Janis)
      na.editPermission(grantPermission.Janis)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
