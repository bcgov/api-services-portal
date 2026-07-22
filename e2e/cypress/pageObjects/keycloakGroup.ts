class keycloakGroupPage {
  path: string = '/'

  groupTab: string = '[data-ng-controller="GroupTabCtrl"]'
  groupSearchInput: string = '[data-testid="table-search-input"] input[type="search"], [data-testid="table-search-input"] input[type="text"], [data-testid="table-search-input"] input'
  userGroupsTab: string = '[data-testid="user-groups-tab"]'
  joinGroupSearchInput: string = 'input[placeholder="Search group"]'
  joinButton: string = '[data-testid="join-button"]'
  confirmButton: string = '[data-testid="confirm"]'
  addAttributeKey: string = '[data-testid="attributes-add-row"]'
  attributeKey: string = '[data-testid="attributes-key"]'
  attributeValue: string = '[data-testid="attributes-value"]'
  saveBtn: string = '[data-testid="attributes-save"]'

  private consoleUrl(): string {
    const base = Cypress.env('KEYCLOAK_URL')
    const realm = Cypress.env('KEYCLOAK_REALM') || 'master'
    return `${base}/auth/admin/master/console/#/${realm}/groups`
  }

  visitGroups() {
    cy.visit(this.consoleUrl())
    cy.get(this.groupSearchInput, { timeout: 20000 }).should('be.visible')
  }

  selectTab(tabName: string) {
    cy.get(this.groupTab).contains('a', tabName).click()
  }

  setAttribute(attKey: string, attValue: string) {
    cy.get(this.addAttributeKey).click()
    cy.get(this.attributeKey).last().type(attKey)
    cy.get(this.attributeValue).last().type(attValue)
    cy.get(this.saveBtn).click()
  }

  openGroupsTab() {
    cy.get(this.userGroupsTab, { timeout: 15000 })
      .should('be.visible')
      .click()
    cy.contains('Join Group', { timeout: 15000 }).should('be.visible')
  }

  setUserToOrganization(orgName: string) {
    cy.contains('Join Group', { timeout: 15000 })
      .should('be.visible')
      .click()
    cy.get(this.joinGroupSearchInput, { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type(orgName)
      .type('{enter}')
    cy.get(`input[data-testid="${orgName}-check"]`, { timeout: 15000 })
      .first()
      .should('exist')
      .click({ force: true })
    cy.get(this.joinButton, { timeout: 10000 })
      .should('be.visible')
      .click()
  }

  leaveGroup(orgName: string) {
    cy.get(`[data-testid="leave-${orgName}"]`, { timeout: 15000 })
      .should('be.visible')
      .click()
    cy.get(this.confirmButton, { timeout: 10000 })
      .should('be.visible')
      .click()
  }
}

export default keycloakGroupPage
