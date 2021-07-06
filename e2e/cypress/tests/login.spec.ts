describe('User navigates aps portal login page and', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('finds login button', () => {
    cy.xpath('//button').contains('Login')
  })

  it('enter credentials to login into portal', () => {
    cy.xpath("//button[normalize-space()='Login']").click()
    const oidcProviderURL = new URL(Cypress.env('oidc-issuer'))

    if (Cypress.env('tests-env') === 'dev') {
      cy.loginToDev(Cypress.env('username'), Cypress.env('password'))
      cy.verifySession(Cypress.config('baseUrl') + '/admin/session')
    }
  })
})
