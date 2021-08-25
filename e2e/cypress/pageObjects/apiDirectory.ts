import { checkElementExists } from '../support'

class ApiDirectoryPage {
  path: string = '/devportal/api-directory'
  rqstAccessBtn: string = '[data-testid=api-rqst-access-btn]'
  appSelect: string = '[data-testid=access-rqst-app-select]'
  additionalNotes: string = '[data-testid=access-rqst-add-notes-text]'
  submitBtn: string = '[data-testid=access-rqst-submit-btn]'

  createAccessRequest(product: any, app: any, accessRqst: any) {
    cy.contains(product.name).click()
    cy.get(this.rqstAccessBtn).click()
    cy.get(this.appSelect).select(app.name)
    cy.get('[data-testid=access-rqst-app-env-' + product.environment + ']').click()
    cy.get(this.additionalNotes).type(accessRqst.notes)
    if (checkElementExists('Terms of Use for API Gateway'))
      cy.contains('Terms of Use for API Gateway').click()
    cy.get(this.submitBtn).click()
  }
}

export default ApiDirectoryPage
