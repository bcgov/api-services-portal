class NamespaceAccessPage {

  userNameInput: string = '[data-testid="nsa-gua-email-field"]'
  grantUserAccessBtn: string = '[data-testid="nsa-grant-access-btn"]'
  saveUserAccessBtn: string = '[data-testid="nsa-gua-share-btn"]'

  grantPermission(accessRqst: any) {
    cy.wait(2000)
    cy.get(this.userNameInput, { timeout: 2000 }).should('be.visible');
    cy.get(this.userNameInput).type(accessRqst.email);
    let accessRole: Array<string> = accessRqst.accessRole
    accessRole.forEach(function (accessName) {
      cy.contains("Permissions").next().find('li').find('label').each(($el, index, $list) => {
        const textAccessRoleName = $el.text()
        cy.log(textAccessRoleName)
        if (textAccessRoleName === accessName) {
          cy.wrap($el).click()
        }
      })
    })
    cy.contains("Share").click()
  }

  editPermission(editPermission: any) {
    cy.wait(2000)
    this.editAccess(editPermission.userName)
    this.clearAllPermission()
    cy.get(this.userNameInput, { timeout: 2000 }).should('be.visible');
    // cy.get(this.userNameInput).type(editPermission.email);
    let accessRole: Array<string> = editPermission.accessRole
    accessRole.forEach(function (accessName) {
      debugger
      cy.contains("Permissions").next().find('li').find('label').each(($el, index, $list) => {
        // cy.wrap($el).find('input').uncheck({ force: true });
        const textAccessRoleName = $el.text()
        cy.log(textAccessRoleName)
        if (textAccessRoleName === accessName) {
          cy.wrap($el).click()
        }
      })
    })
    cy.get(this.saveUserAccessBtn).click()
  }

  revokePermission(revokePermission: any) {
    let accessRole: Array<string> = revokePermission.accessRole
    accessRole.forEach(function (accessName) {
      cy.contains(revokePermission.userName).parents('tr').find('td:nth-child(2)').find('span').each(($e1, index, $list) => {
        const text = $e1.text()
        if (text === accessName) {
          cy.wrap($e1).find('button').click()
        }
      })
      cy.wait(1000)
    })
  }

  revokeAllPermission(user: string) {
    cy.contains(user).parents('tr').find('td:nth-child(3)').children('button').click()
    cy.get('[data-testid$="-revoke-btn"]').filter(':visible').first().click()
  }

  editAccess(user: string) {
    cy.contains(user).parents('tr').find('td:nth-child(3)').children('button').click()
    cy.get('[data-testid$="-edit-btn"]').filter(':visible').first().click()
  }

  clearAllPermission()
  {
    cy.contains("Permissions").next().find('li').find('label').each(($el, index, $list) => {
      // cy.wrap($el).find('input').uncheck({ force: true });
      cy.wrap($el).find('input')
        .as('checkbox')
        .invoke('is', ':checked')
        .then(checked => {
          cy
            .get('@checkbox')
            .uncheck({ force: true });
        })
      })
  }

  path: string = '/manager/namespace-access'

  clickGrantUserAccessButton() {
    cy.wait(3000)
    cy.get('[data-testid="nsa-users-table-row-0-menu"]', { timeout: 5000 }).should('be.visible');
    cy.get(this.grantUserAccessBtn).first().click({ force: true })
  }
}
export default NamespaceAccessPage

