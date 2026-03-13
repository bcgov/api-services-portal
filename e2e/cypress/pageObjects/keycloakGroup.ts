class keycloakGroupPage {

  path: string = '/'

  groupTab: string = '[data-ng-controller="GroupTabCtrl"]'
  addAttributeKey: string = '[data-testid="attributes-add-row"]'
  attributeKey: string = '[data-testid="attributes-key"]'
  attributeValue: string = '[data-testid="attributes-value"]'
  saveBtn: string = '[data-testid="attributes-save"]'

  selectTab(tabName: string){
    cy.get(this.groupTab).contains('a',tabName).click()
  }

  setAttribute(attKey: string, attValue: string){
    cy.get(this.addAttributeKey).click()
    cy.get(this.attributeKey).last().type(attKey)
    cy.get(this.attributeValue).last().type(attValue)
    cy.get(this.saveBtn).click()
  }
}

export default keycloakGroupPage
