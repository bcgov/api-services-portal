class keycloakUsersPage {

  path: string = '/'

  userNameTxt: string = '[placeholder="Search..."]'
  userSearch: string = '[id="userSearch"]'
  userTab: string = '[data-ng-controller="UserTabCtrl"]'

  selectTab(tabName: string) {
    cy.get(this.userTab).contains('a', tabName).click()
  }

  editUser(userName: string) {
    cy.get(this.userNameTxt).type(userName)
    cy.get(this.userSearch).click()
    cy.wait(1000)
    cy.contains('Edit').click()
  }

  setUserToOrganization(orgName: string) {
    cy.contains(orgName).click()
    cy.contains('Join').click()
  }

  resetAssociation() {
    cy.get('[data-ng-click="membershipTree.selectNodeLabel(node)"]').click()
    cy.contains('Leave').click({force:true})
  }

}

export default keycloakUsersPage
