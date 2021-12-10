import { checkElementExists } from '../support'

class myAccessPage {
  generateSecretsBtn: string = '[data-testid=access-rqst-gen-scrts-btn]'
  apiKyeValueTxt: string = '[data-testid=sa-new-creds-api-key]'

  clickOnGenerateSecretButton(){
    cy.get(this.generateSecretsBtn).click()
    cy.contains("API Key").should('be.visible')
  }

  saveAPIKeyValue():void{
    cy.get(this.apiKyeValueTxt).then(($apiKey) => {
      cy.saveState("APIKey",$apiKey.text())
    })
  }

}

export default myAccessPage
