class WebAppPage {


  corsButton: string = '[id="corsButton"]'
  corsResponseTxt: string = '[id="corsResponse"]'
  corsButtonForHeader: string = '[id="corsButtonForInvalidHeader"]'
  corsResponseTxtForHeader: string = '[id="corsResponseInvalidRequest"]'

  getStatusAfterClickOnCORSForHeaders(): Cypress.Chainable<any> {
    cy.wait(5000)
    cy.get(this.corsButtonForHeader).click({force:true})
    cy.wait(8000)
    // Perform interactions or assertions on the page elements
    debugger
    return cy.get(this.corsResponseTxtForHeader).invoke('text').then((text:any) => {
      debugger
      return  text
    })
  }

  getStatusAfterClickOnCORS(): Cypress.Chainable<any> {
    cy.wait(5000)
    cy.get(this.corsButton).click({force:true})
    cy.wait(8000)
    // Perform interactions or assertions on the page elements
    debugger
    return cy.get(this.corsResponseTxt).invoke('text').then((text:any) => {
      debugger
      return  text
    })
  }
}
export default WebAppPage