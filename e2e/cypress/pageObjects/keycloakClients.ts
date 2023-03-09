class keycloakClientsPage {
  path: string = '/'

  clientTab: string = '[data-ng-controller="ClientTabCtrl"]'
  roleNameTextField: string = '[id="name"]'
  addAttributeBtn: string = '[data-ng-click="addAttribute()"]'

  selectTab(tabName: string){
    cy.get(this.clientTab).contains('a',tabName).click()
  }

  setRoles(roleName: string, clientName: string){
    cy.wait(2000)
    cy.contains('Clients').click()
    cy.contains(clientName).click()
    this.selectTab('Roles')
    cy.contains('Add Role').click()
    cy.get(this.roleNameTextField).type(roleName)
    cy.contains('Save').click()
    cy.wait(4000)
  }
}

export default keycloakClientsPage
