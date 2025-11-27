class keycloakClientsPage {
  path: string = '/'

  clientTabs: string = '[data-testid="client-tabs"]'
  createRoleBtn: string = '[data-testid="create-role"]'
  roleNameTextField: string = '[data-testid="name"]'
  saveBtn: string = '[data-testid="save"]'
  addAttributeBtn: string = '[data-ng-click="addAttribute()"]'

  selectTab(tabName: string){
    cy.get(this.clientTabs).contains('a',tabName).click({ force: true })
  }

  setRoles(roleName: string, clientName: string){
    cy.get('[id=nav-toggle').click()
    cy.contains('Clients').click()
    cy.contains(clientName).click({ force: true })
    this.selectTab('Roles')
    cy.get(this.createRoleBtn).click()
    cy.get(this.roleNameTextField).type(roleName)
    cy.get(this.saveBtn).click()
  }
}

export default keycloakClientsPage
