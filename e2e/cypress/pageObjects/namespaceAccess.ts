class NamespaceAccessPage {

  userNameInput: string = '[data-testid="nsa-gua-username-field"]'
  grantUserAccessBtn: string = '[data-testid="nsa-grant-access-btn"]'

  grantPermission(accessRqst: any) {
    cy.get(this.userNameInput,{ timeout: 2000 }).should('be.visible');
    cy.get(this.userNameInput).type(accessRqst.userName);
    let accessRole: Array<string> = accessRqst.accessRole
    accessRole.forEach(function (accessName) {
      cy.contains("Permissions").next().find('li').each(($el, index, $list) => {
        const textAccessRoleName = $el.text()
        cy.log(textAccessRoleName)
        if (textAccessRoleName === accessName) {
          cy.wrap($el).click()
        }
      })
    })
    cy.contains("Share").click()
    cy.wait(2000)
  }

  revokePermission(revokePermission: any) {
    let accessRole: Array<string> = revokePermission.accessRole
    accessRole.forEach(function (accessName) {
      // cy.contains(revokePermission.userName).parents('tr').find('td:nth-child(2)').each(($e1, index, $list) => {
        cy.contains(revokePermission.userName).parents('tr').find('td:nth-child(2)').find('span').each(($e1, index, $list) => {
        const text = $e1.text()
        if (text === accessName) {
          cy.wrap($e1).find('button').click()
        }
      })
      cy.wait(1000)
    })
  }

  revokeAllPermission(user :string)
  {
    cy.contains(user.toLowerCase()).parents('tr').find('td:nth-child(3)').children('button').click()
    cy.get('[data-testid$="-revoke-btn"]').filter(':visible').first().click()
    cy.wait(2000)
  }
  
  path: string = '/manager/namespace-access'

  clickGrantUserAccessButton() {
    cy.get('[data-testid="nsa-users-table-row-0-menu"]',{ timeout: 5000 }).should('be.visible');
    cy.get(this.grantUserAccessBtn).first().click({force:true})
    cy.wait(2000)
  }
}
export default NamespaceAccessPage

