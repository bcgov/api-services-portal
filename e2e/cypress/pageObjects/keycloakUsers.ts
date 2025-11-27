class keycloakUsersPage {

  path: string = '/'

  userSearchInput: string = '[data-testid="table-search-input"]'
  userTab: string = '[data-ng-controller="UserTabCtrl"]'
  groupsTab: string = '[data-testid="user-groups-tab"]'


  selectTab(tabName: string) {
    cy.get(this.userTab).contains('a', tabName).click()
  }

  editUser(userName: string) {
    cy.get(this.userSearchInput).type(userName).type('{enter}')
    cy.get('a').contains(userName).click()
  }

  setUserToOrganization(orgName: string) {
    cy.contains('Join Group').click()
    cy.get('input[placeholder="Search group"]').type(orgName).type('{enter}')
    cy.get(`input[data-testid="${orgName}-check"]`).click()
    cy.get('[data-testid="join-button"]').click()
  }

  resetAssociation() {
    cy.get('[data-ng-click="membershipTree.selectNodeLabel(node)"]').click()
    cy.contains('Leave').click({force:true})
  }

}

export default keycloakUsersPage
