describe('User navigates aps portal login page and', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('finds login button', () => {
    cy.xpath('//button').contains('Login')
  })

  it('enter credentials to login into portal', () => {
    cy.xpath("//button[normalize-space()='Login']").click()
    const oidcProviderURL = new URL(Cypress.env('OIDC_ISSUER'))

    if (Cypress.env('TESTS_ENV') === 'dev') {
      cy.loginToDev(Cypress.env('PORTAL_USERNAME'), Cypress.env('PORTAL_PASSWORD'))
      cy.verifySession(Cypress.config('baseUrl') + '/admin/session')
    }
  })
})
