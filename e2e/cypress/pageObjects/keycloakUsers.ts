class keycloakUsersPage {
  path: string = '/'

  userSearchInput: string = '[data-testid="table-search-input"] input'
  userTab: string = '[data-ng-controller="UserTabCtrl"]'

  private consoleUrl(): string {
    const base = Cypress.env('KEYCLOAK_URL')
    const realm = Cypress.env('KEYCLOAK_REALM') || 'master'
    return `${base}/auth/admin/master/console/#/${realm}/users`
  }

  visitUsers() {
    cy.visit(this.consoleUrl())
    cy.get(this.userSearchInput, { timeout: 20000 }).should('be.visible')
  }

  selectTab(tabName: string) {
    cy.get(this.userTab).contains('a', tabName).click()
  }

  editUser(userName: string) {
    cy.get(this.userSearchInput, { timeout: 20000 })
      .should('be.visible')
      .clear()
      .type(userName)
      .type('{enter}')
    cy.contains('a', userName, { timeout: 15000 })
      .should('be.visible')
      .click()
    cy.url({ timeout: 15000 }).should('include', '/users/')
  }
}

export default keycloakUsersPage
