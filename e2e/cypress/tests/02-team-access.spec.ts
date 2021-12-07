import HomePage from '../pageObjects/home'
import LoginPage from '../pageObjects/login'
import NamespaceAccessPage from '../pageObjects/namespaceAccess'

describe('Create API Spec', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.clearCookies({log:true})
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
      cy.log('Logged in!')
    })
  })

  it('grant namespace access to access manager(Mark)', () => {
    cy.get('@apiowner').then(({ permission, namespace }: any) => {
        cy.visit(na.path);
        home.useNamespace(namespace);
        na.clickGrantUserAccessButton()
        na.grantPermission(permission.Mark)

  })
})
  
  after(() => {
    cy.logout()
    cy.clearLocalStorage({log:true})
    cy.deleteAllCookies()
  })
})
