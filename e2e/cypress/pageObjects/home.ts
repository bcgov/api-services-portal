class HomePage {
  namespaceDropdown: string = '/html/body/div[1]/header/hgroup[2]/div[1]/div/button'

  namespaceNameInput: string = '/html/body/div[3]/div[4]/div/section/div/form/div/input'

  createNamespace(name: string): void {
    cy.xpath(this.namespaceDropdown).click()
    cy.contains('Create New Namespace').click()
    cy.xpath(this.namespaceNameInput).should('be.visible').type(name) // using `platform` as a default ns as its being seeding through feeder
    cy.xpath("//button[normalize-space()='Create']").click()
  }

  useNamespace(name: string): void {
    cy.xpath(this.namespaceDropdown).click()
    cy.contains(name).click()
    cy.xpath(this.namespaceDropdown).should('include.text', name)
  }
}

export default HomePage
