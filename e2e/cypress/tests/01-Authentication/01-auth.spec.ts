import LoginPage from '../../pageObjects/login'

describe('Authentication spec', () => {
  const login = new LoginPage()
  before(() => {
    cy.resetState()
  })
  beforeEach(() => {
    cy.fixture('developer').as('developer')
    cy.visit(login.path)
    cy.preserveCookies()
  })
  it('should find login button', () => {
    cy.xpath(login.loginButton).should('be.visible')
  })

  it('should allow user to authenticate', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('should save user session after login', () => {
    cy.getSession().then(() => {
      cy.get('@session').then((res: any) => {
        expect(res.body).to.include({ anonymous: false })
      })
    })
  })

  it('should allow user to logout', () => {
    cy.logout()
  })
})
