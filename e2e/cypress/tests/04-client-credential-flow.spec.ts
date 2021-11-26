import LoginPage from '../pageObjects/login'
import AuthorizationProfile from '../pageObjects/authProfile'
import HomePage from '../pageObjects/home'

describe('Client Credential Flow', () => {

  const login = new LoginPage();
  const authProfile = new AuthorizationProfile();
  const home = new HomePage();

  before(() => {
    cy.visit('/')
    cy.clearCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    // cy.fixture('developer').as('developer')
    cy.visit(login.path)
  })

  it('Logs in as API Owner', () => {
    cy.get('@apiowner').then(({ user, namespace }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
      home.useNamespace(namespace);
    })
  })
  
  it('Creates Auth Profile', () => {
    cy.visit(authProfile.path)
    cy.get('@apiowner').then(({ ccAuthProfile }: any) => {
      cy.log("Hello!")
      console.log(ccAuthProfile)
      authProfile.createAuthProfile(ccAuthProfile);
    })
  })

  after(() => {
    cy.logout()
  })
})
