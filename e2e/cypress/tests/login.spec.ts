describe('Login spec', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('should have login button', () => {
    cy.xpath('//button').contains('Login')
  })

  it('should allow user to authenticate', () => {
    cy.xpath("//button[normalize-space()='Login']").click()

    if (Cypress.env('TESTS_ENV') === 'dev') {
      cy.loginToDev(Cypress.env('PORTAL_USERNAME'), Cypress.env('PORTAL_PASSWORD'))
    }
  })

  it('should save user session after login', () => {
    cy.getSession(Cypress.config('baseUrl') + '/admin/session').then((sessionObj: any) => {
      cy.log('logged user - ' + JSON.stringify(sessionObj.user))
    })
  })
})
