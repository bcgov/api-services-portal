describe('aps portal login page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('displays login button', () => {
    cy.xpath('//button').contains('Login')
  })

  it('login into portal', () => {
    cy.xpath("//button[normalize-space()='Login']").click()
    const oidcProviderURL = new URL(Cypress.env('oidc-issuer'))

    if (Cypress.env('tests-env') === 'dev') {
      cy.loginToDev(Cypress.env('username'), Cypress.env('password'))
      cy.verifySession(Cypress.config('baseUrl') + '/admin/session')
    }
  })
})
