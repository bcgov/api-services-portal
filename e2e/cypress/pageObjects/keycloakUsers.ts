class keycloakUsersPage {
  path: string = '/'

  // Match Keycloak admin search inputs across Users/Groups table variants
  userSearchInput: string =
    '[data-testid="table-search-input"] input[type="search"], [data-testid="table-search-input"] input[type="text"], [data-testid="table-search-input"] input'
  userTab: string = '[data-ng-controller="UserTabCtrl"]'

  private consoleRoot(): string {
    const base = Cypress.env('KEYCLOAK_URL')
    return `${base}/auth/admin/master/console/`
  }

  private usersHash(): string {
    const realm = Cypress.env('KEYCLOAK_REALM') || 'master'
    return `#/${realm}/users`
  }

  private consoleUrl(): string {
    return `${this.consoleRoot()}${this.usersHash()}`
  }

  visitUsers() {
    // Cypress skips reload when only the hash changes (e.g. Groups -> Users).
    // Load the console root first, then set the users hash so the SPA navigates.
    cy.visit(this.consoleRoot())
    cy.get('body', { timeout: 20000 }).should('be.visible')
    cy.window().then((win) => {
      if (win.location.hash !== this.usersHash()) {
        win.location.hash = this.usersHash()
      }
    })
    cy.location('hash', { timeout: 20000 }).should('include', '/users')
    cy.get(this.userSearchInput, { timeout: 20000 })
      .first()
      .should('be.visible')
  }

  selectTab(tabName: string) {
    cy.get(this.userTab).contains('a', tabName).click()
  }

  editUser(userName: string) {
    cy.get(this.userSearchInput, { timeout: 20000 })
      .first()
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
