class HomePage {
  nsDropdown: string = '[data-testid=ns-dropdown-btn]'
  nsDropdownCreateNsBtn: string = '[data-testid=ns-dropdown-create-btn]'
  nsDropdownManageNsBtn: string = '[data-testid=ns-dropdown-manage-btn]'
  namespaceNameInput: string = '[data-testid=ns-modal-name-input]'
  nsCreateBtn: string = '[data-testid=ns-modal-create-btn]'
  nsSelectNamespace: string = '[data-testid=ns-dropdown-item-]'
  userMenu: string = '[data-testid=auth-menu-user]'

  createNamespace(name: string): void {
    cy.get(this.nsDropdown).click()
    cy.get(this.nsDropdownCreateNsBtn).click()
    cy.get(this.namespaceNameInput).type(name) // using `platform` as a default ns as its being seeding through feeder
    cy.get(this.nsCreateBtn).click()
    cy.wait(2000) // wait for dropdown to have latest text
    cy.get(this.nsDropdown).then(($el) => {
      expect($el).contain(name)
    })
  }

  useNamespace(name: string): Boolean {
    var flag = new Boolean(false);
    cy.get(this.nsDropdown).click()
    cy.get(this.getNamespaceTestId(name)).click()
    cy.wait(2000) // wait for dropdown to have latest text
    cy.get(this.nsDropdown).then(($el) => {
      expect($el.text().trim()).to.eq(name)
      debugger
      flag = true
    })
    return flag
  }

  getNamespaceTestId(name: string): string {
    return '[data-testid=ns-dropdown-item-' + name + ']'
  }

}

export default HomePage
