import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'

describe('Namespace spec', () => {
  const login = new LoginPage()
  const home = new HomePage()

  beforeEach(() => {
    cy.fixture('apiowner').as('apiowner')
    cy.visit(login.path)
    cy.preserveCookies()
  })
  it('find login button', () => {
    cy.xpath(login.loginButton).should('be.visible')
  })

  it('user authentication', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('should allow user to create and switch to new namespace', () => {
    cy.get('@apiowner').then(({ namespace }: any) => {
      home.createNamespace(namespace)
      home.useNamespace(namespace)
    })
  })

  after(() => {
    cy.logout()
  })
})
