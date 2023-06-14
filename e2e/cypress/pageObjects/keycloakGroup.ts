class keycloakGroupPage {

  path: string = '/'

  groupTab: string = '[data-ng-controller="GroupTabCtrl"]'
  attributeKey: string = '[ng-model="newAttribute.key"]'
  attributeValue: string = '[ng-model="newAttribute.value"]'
  addAttributeBtn: string = '[data-ng-click="addAttribute()"]'

  selectTab(tabName: string){
    cy.get(this.groupTab).contains('a',tabName).click()
  }

  setAttribute(attKey: string, attValue: string){
    cy.wait(2000)
    cy.get(this.attributeKey).type(attKey)
    cy.get(this.attributeValue).type(attValue)
    cy.get(this.addAttributeBtn).click()
    cy.contains('button','Save').click()
  }

  navigateToUserGroups() {
    cy.contains('Groups').click()
  }
}

export default keycloakGroupPage
