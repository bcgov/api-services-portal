class HomePage {
  namespaceDropdown: string =
    '/html[1]/body[1]/div[1]/header[1]/hgroup[2]/div[1]/div[1]/button[1]'

  namespaceSelected: string = '/html/body/div[1]/header/hgroup[2]/div[1]/div/button/span'

  namespaceNameInput: string = '/html/body/div[3]/div[4]/div/section/div/form/div/input'

  createNamespace(name: string): void {
    cy.xpath(this.namespaceDropdown).click()
    cy.contains('Create New Namespace').click()
    cy.xpath(this.namespaceNameInput).should('be.visible').type(name) // using `platform` as a default ns as its being seeding through feeder
    cy.xpath("//button[normalize-space()='Create']").click()
    cy.contains('Namespace ' + name + ' created!').should('be.visible')
    cy.contains('Switched to ' + name + ' namespace').should('be.visible')
  }

  useNamespace(name: string): void {
    cy.xpath(this.namespaceDropdown).click()
    cy.contains(name).click()
    cy.contains('Switched to ' + name + ' namespace').should('be.visible')
    cy.xpath(this.namespaceSelected).should('include.text', name)
  }
}

export default HomePage
