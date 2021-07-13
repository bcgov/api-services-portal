describe('Authentication spec', () => {
  before(() => {
    cy.clearCookies()
  })
  afterEach(() => {
    cy.saveCookies()
  })
  it('should find login button', () => {
    cy.visit('/')
    cy.xpath('//button').contains('Login')
  })

  it('should allow user to authenticate', () => {
    cy.login(Cypress.env('PORTAL_USERNAME'), Cypress.env('PORTAL_PASSWORD'))
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
