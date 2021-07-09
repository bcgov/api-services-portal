describe('Logout spec', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('should check user session and login if not logged on', () => {
    if (cy.xpath('//button').contains('Login')) {
      cy.login(Cypress.env('PORTAL_USERNAME'), Cypress.env('PORTAL_PASSWORD'))
      cy.getSession(Cypress.config('baseUrl') + '/admin/session').then((sessionObj: any) => {
        cy.log('logged user - ' + JSON.stringify(sessionObj.user))
      })
    } else {
      cy.getSession(Cypress.config('baseUrl') + '/admin/session').then((sessionObj: any) => {
        cy.log('logged user - ' + JSON.stringify(sessionObj.user))
      })
    }
  })

  it('should allow user to logout', () => {
    cy.getSession(Cypress.config('baseUrl') + '/admin/session').then((sessionObj: any) => {
      cy.contains(sessionObj.user.name).click()
    })

    cy.contains('Sign Out').click()
  })

  it('should show login button after logout', () => {
    cy.xpath('//button').contains('Login')
  })
})
