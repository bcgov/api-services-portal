class KeycloakUserGroupPage {
  path: string = '/'

  editButton: string = '[id="editGroup"]'
  groupTab: string = '[data-ng-controller="GroupTabCtrl"]'

  selectTab(tabName: string){
    cy.get(this.groupTab).contains('a',tabName).click()
  }

  clickOnEditButton()
  {
    cy.get(this.editButton).click()
  }
}

export default KeycloakUserGroupPage
