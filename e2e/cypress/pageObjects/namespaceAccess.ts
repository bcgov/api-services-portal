class NamespaceAccessPage {

  userNameInput: string = 'input[name="username"]'
  grantPermission(accessRqst: any) {
    cy.get(this.userNameInput).type(accessRqst.userName);
    let accessRole: Array<string> = accessRqst.accessRole
    accessRole.forEach(function (accessName) {
      cy.contains("Permissions").next().find('ul').find('li').each(($el, index, $list) => {
        const textAccessRoleName = $el.text()
        cy.log(textAccessRoleName)
        if (textAccessRoleName === accessName) {
          cy.wrap($el).click()
        }
      })
    })
    cy.contains("Share").click()
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

  revokeAllPermission(user :string)
  {
    cy.contains(user).parents('tr').find('td:nth-child(3)').find('button').click()
  }
  
  path: string = '/manager/namespace-access'

  clickGrantUserAccessButton() {
    cy.contains("Grant User Access").click()
  }
}
export default NamespaceAccessPage

