class NamespaceAccess {
  path: string = "/manager/namespace-access"
  grantAccBtn: string = '[data-testid="nsa-grant-access-btn"]'
  nameField: string = '[data-testid="nsa-gua-username-field"]'
  shareBtn: string = '[data-testid="nsa-gua-share-btn"]'

  addNamespaceAccessPermissions(username: string, permissions: Array<string>) {
    cy.get(this.grantAccBtn).click();
    cy.get(this.nameField).click().type(username);

    permissions.forEach(p => cy.contains(p).click())

    cy.get(this.shareBtn).click()

    // cy.get(':nth-child(2) > .css-15mzruk').should('exist') // or 'be.visible'?
  }
}
    
export default NamespaceAccess;