class myAccessPage {
  generateSecretsBtn: string = '[data-testid=access-rqst-gen-scrts-btn]'
  apiKyeValueTxt: string = '[data-testid=sa-new-creds-api-key]'
  clientId: string = '[data-testid=sa-new-creds-client-id]'
  clientSecret: string = '[data-testid=sa-new-creds-client-secret]'
  tokenEndpoint: string = '[data-testid=sa-new-creds-token-endpoint]'

  clickOnGenerateSecretButton() {
    cy.get(this.generateSecretsBtn).click()
  }

  saveAPIKeyValue(): void {
    cy.get(this.apiKyeValueTxt).then(($apiKey) => {
      cy.saveState('APIKey', $apiKey.text())
    })
  }

  saveClientCredentials(): void {
    cy.get(this.clientId).then(($clientId) => {
      cy.get(this.clientSecret).then(($clientSecret) => {
        cy.get(this.tokenEndpoint).then(($tokenEndpoint) => {
          cy.saveState(
            'clientCredentials',
            '{"clientId": "' +
              $clientId.text() +
              '", "clientSecret": "' +
              $clientSecret.text() +
              '", "tokenEndpoint": "' +
              $tokenEndpoint.text() +
              '"}'
          )
        })
      })
    })
  }
}

export default myAccessPage
