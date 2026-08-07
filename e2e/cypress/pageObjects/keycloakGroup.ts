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

  private consoleRoot(): string {
    const base = Cypress.env('KEYCLOAK_URL')
    return `${base}/auth/admin/master/console/`
  }

  private groupsHash(): string {
    const realm = Cypress.env('KEYCLOAK_REALM') || 'master'
    return `#/${realm}/groups`
  }

  private consoleUrl(): string {
    return `${this.consoleRoot()}${this.groupsHash()}`
  }

  visitGroups() {
    // Cypress skips reload when only the hash changes. Load console root first,
    // then set the groups hash so the SPA always remounts the Groups view.
    cy.visit(this.consoleRoot())
    cy.get('body', { timeout: 20000 }).should('be.visible')
    cy.window().then((win) => {
      if (win.location.hash !== this.groupsHash()) {
        win.location.hash = this.groupsHash()
      }
    })
    cy.location('hash', { timeout: 20000 }).should('include', '/groups')
    cy.get(this.groupSearchInput, { timeout: 20000 })
      .first()
      .should('be.visible')
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
    cy.contains('button', 'Join Group', { timeout: 20000 }).should(
      'be.visible'
    )
  }

  private dismissOpenDialog() {
    cy.get('body').then(($body) => {
      if ($body.find('[role="dialog"]').length === 0) {
        return
      }
      cy.get('body').type('{esc}')
      cy.get('[role="dialog"]', { timeout: 10000 }).should('not.exist')
    })
  }

  setUserToOrganization(orgName: string) {
    const leaveSel = `[data-testid="leave-${orgName}"]`

    // Retries can leave the Join Groups modal open, which hides "Join Group".
    this.dismissOpenDialog()

    cy.get('body').then(($body) => {
      if ($body.find(leaveSel).length > 0) {
        cy.log(`User already belongs to ${orgName}; skipping join`)
        return
      }

      cy.contains('button', 'Join Group', { timeout: 15000 })
        .should('be.visible')
        .click()

      // Scope to the modal — Keycloak also keeps a hidden/duplicate search input in the page.
      cy.get('[role="dialog"]', { timeout: 15000 }).should('be.visible')
      cy.get('[role="dialog"] input[placeholder="Search group"]', {
        timeout: 15000,
      })
        .filter(':visible')
        .first()
        .should('be.visible')
        .click()
        .type('{selectall}{backspace}')
        .type(orgName)
        .type('{enter}')

      cy.get(
        `[role="dialog"] input[data-testid="${orgName}-check"]`,
        { timeout: 15000 }
      )
        .first()
        .should('exist')
        .click({ force: true })

      cy.get(`[role="dialog"] ${this.joinButton}`, { timeout: 10000 })
        .should('be.visible')
        .and('not.be.disabled')
        .click()

      cy.get('[role="dialog"]', { timeout: 10000 }).should('not.exist')
      cy.get(leaveSel, { timeout: 15000 }).should('be.visible')
    })
  }

  leaveGroup(orgName: string) {
    cy.get(`[data-testid="leave-${orgName}"]`, { timeout: 15000 })
      .should('be.visible')
      .click()
    cy.get(this.confirmButton, { timeout: 10000 })
      .should('be.visible')
      .click()
  }

  leaveGroupIfPresent(orgName: string) {
    this.dismissOpenDialog()
    cy.get('body').then(($body) => {
      const sel = `[data-testid="leave-${orgName}"]`
      if ($body.find(sel).length === 0) {
        cy.log(`User is not in ${orgName}; skipping leave`)
        return
      }
      cy.get(sel).should('be.visible').click()
      cy.get(this.confirmButton, { timeout: 10000 })
        .should('be.visible')
        .click()
      cy.get(sel).should('not.exist')
    })
  }
}

export default keycloakGroupPage
