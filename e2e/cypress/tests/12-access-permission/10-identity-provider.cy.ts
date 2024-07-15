import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NameSpacePage from '../../pageObjects/namespace'

describe('Confirm users can see the proper nav bar items', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const ns = new NameSpacePage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner) - IDIR', () => {
    cy.get('@apiowner').then(({ user }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        cy.get(home.apiDirectoryNavButtom).should('be.visible')
        cy.get(home.accessNavButtom).should('be.visible')
        cy.get(home.applicationsNavButtom).should('be.visible')
        cy.get(home.gatewaysNavButtom).should('be.visible')
    })
  })

  it('authenticates Janis (api owner) - GitHub', () => {
    cy.get('@apiowner').then(({ githubUser }: any) => {
        cy.login(githubUser.credentials.username, githubUser.credentials.password, true)
        cy.get(home.apiDirectoryNavButtom).should('be.visible')
        cy.get(home.accessNavButtom).should('be.visible')
        cy.get(home.applicationsNavButtom).should('be.visible')
        cy.get(home.gatewaysNavButtom).should('not.exist')
    })
  })

  afterEach(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})
