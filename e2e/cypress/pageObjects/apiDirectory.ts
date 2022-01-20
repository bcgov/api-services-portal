import { checkElementExists } from '../support'

class ApiDirectoryPage {
  path: string = '/devportal/api-directory'
  rqstAccessBtn: string = '[data-testid=api-rqst-access-btn]'
  appSelect: string = '[data-testid=access-rqst-app-select]'
  additionalNotes: string = '[data-testid=access-rqst-add-notes-text]'
  submitBtn: string = '[data-testid=access-rqst-submit-btn]'
  generateSecretsBtn: string = '[data-testid=access-rqst-gen-scrts-btn]'
  clientIdField: string = '[data-testid=sa-new-creds-client-id]';
  clientSecretField: string = '[data-testid=sa-new-creds-client-secret]';
  tokenEndpointField: string = '[data-testid=sa-new-creds-token-endpoint]';
  acceptTermsBtn: string = '[data-testid=access-rqst-legal-terms-cb]';
  jwksUrlField: string = '[data-testid=access-rqst-jwks-url]';
  

  createAccessRequest(product: any, app: any, accessRqst: any) {
    cy.contains('a',product.name, { timeout: 10000 }).should('be.visible');
    cy.contains(product.name).click()
    cy.get(this.rqstAccessBtn).click()
    cy.get(this.appSelect).select(app.name)
    cy.get('[data-testid=access-rqst-app-env-' + product.environment + ']').click()

    cy.document().then((doc) => {
      if (doc.querySelector(this.acceptTermsBtn)) {
        cy.contains('Terms of Use for API Gateway').click()
      }
      if (doc.querySelector(this.jwksUrlField)) {
        cy.get(this.jwksUrlField).click().type(Cypress.env('JWKS_URL'))
      }
    })

    cy.get(this.additionalNotes).type(accessRqst.notes)
    cy.get(this.submitBtn).click()
  };
}

export default ApiDirectoryPage
