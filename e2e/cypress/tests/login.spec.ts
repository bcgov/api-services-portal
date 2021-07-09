describe('Login spec', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('should have login button', () => {
    cy.xpath('//button').contains('Login')
  })

  it('should allow user to authenticate', () => {
    cy.login(Cypress.env('PORTAL_USERNAME'), Cypress.env('PORTAL_PASSWORD'))
  })

  it('should save user session after login', () => {
    cy.getSession(Cypress.config('baseUrl') + '/admin/session').then((sessionObj: any) => {
      cy.log('logged user - ' + JSON.stringify(sessionObj.user))
    })
  })
})
