class NamespaceAccessPage {

  userNameInput: string = 'input[name="username"]'
  grantPermission(accessRqst : any) {
    cy.get(this.userNameInput).type(accessRqst.userName);
    let accessRole: Array<string> = accessRqst.accessRole
    accessRole.forEach(function(accessName)
    {
      cy.contains("Permissions").next().find('ul').find('li').each(($el, index, $list) => {

        const textAccessRoleName=$el.text()
        cy.log(textAccessRoleName)
        if(textAccessRoleName===accessName)
        {
          cy.wrap($el).click()
        }
        })
    })   
    cy.contains("Share").click()
  }
    
  path: string = '/manager/namespace-access'

  clickGrantUserAccessButton() {
    cy.contains("Grant User Access").click()
  }   
}
  export default NamespaceAccessPage
<<<<<<< HEAD
  
=======
  
>>>>>>> ab59d526 (Made changes for ZenHub ticket #250)
