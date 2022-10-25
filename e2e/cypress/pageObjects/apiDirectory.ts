import { checkElementExists } from '../support'

class ApiDirectoryPage {
  path: string = '/devportal/api-directory'
  rqstAccessBtn: string = '[data-testid=request-access-button]'
  appSelect: string = '[data-testid=access-application-select]'
  additionalNotes: string = '[data-testid=access-rqst-add-notes-text]'
  submitBtn: string = '[data-testid=access-request-submit-button]'
  generateSecretsBtn: string = '[data-testid=access-rqst-gen-scrts-btn]'
  clientIdField: string = '[data-testid=sa-new-creds-client-id]';
  clientSecretField: string = '[data-testid=sa-new-creds-client-secret]';
  tokenEndpointField: string = '[data-testid=sa-new-creds-token-endpoint]';
  acceptTermsBtn: string = '[data-testid=access-rqst-legal-terms-cb]';
  // jwksUrlField: string = '[data-testid=access-rqst-jwks-url]';
  jwksUrlField: string = '[name=jwksUrl]';
  legatTermCheckBox: string = '[data-testid=acceptLegalTerm]';
  jwksURLField: string = '[name=jwksUrl]'
  createAccessRequest(product: any, app: any, accessRqst: any) {
    cy.contains('a', product.name, { timeout: 10000 }).should('be.visible');
    cy.contains(product.name).click()
    cy.get(this.rqstAccessBtn).click()
    cy.get(this.appSelect).select(app.name)
    cy.get('[data-testid=access-rqst-app-env-' + product.environment + ']').click()

    cy.get('body', { log: false }).then(($body) => {
      if ($body.find(this.legatTermCheckBox).length > 0) {
        cy.get(this.legatTermCheckBox).first().click()
      }
    })

    cy.get('body', { log: false }).then(($body) => {
      if ($body.find(this.jwksUrlField).length > 0) {
        cy.get(this.jwksUrlField).click().type(Cypress.env('JWKS_URL'))
      }
    })
    // cy.document().then((doc) => {
    //   if (doc.querySelector(this.jwksUrlField)) {
    //     cy.get(this.jwksUrlField).click().type(Cypress.env('JWKS_URL'))
    //   }
    // })
    cy.get(this.additionalNotes).type(accessRqst.notes)
    cy.get(this.submitBtn).click()
  }

  isProductDisplay(productName: string): Boolean {
    var flag = false;
    cy.get('body', {timeout: 6000}).then(($body) => {
      const pname: string = productName.toLowerCase().replaceAll(' ', '-')
      var ele : string = `[data-testid=api-${pname}]`
      cy.log('Body -> '+ $body)
      if ($body.find(ele).length > 0) {
        flag = true
      }
      else{
        flag = false
      }
    })
    return flag
  }

  navigateToYourProduct() {
    cy.contains("Your Products").click()
    cy.wait(3000)
  }

  selectProduct(productName: string){
    const pname: string = productName.toLowerCase().replaceAll(' ', '-')
    var ele : string = `[data-testid=api-${pname}]`
    cy.get(ele).click()
  }
}

export default ApiDirectoryPage
