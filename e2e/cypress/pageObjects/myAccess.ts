class myAccessPage {
  generateSecretsBtn: string = '[data-testid=generate-secrets-button]'
  apiKyeValueTxt: string = '[data-testid=sa-new-creds-api-key]'
  clientId: string = '[data-testid=sa-new-creds-client-id]'
  clientSecret: string = '[data-testid=sa-new-creds-client-secret]'
  tokenEndpoint: string = '[data-testid=sa-new-creds-token-endpoint]'
  privateKey: string = '[data-testid=sa-new-creds-signing-private-key]'
  publicKey: string = '[data-testid=sa-new-creds-signing-public-certificate]'
  issuer: string = '[data-testid=sa-new-creds-issuer]'
  closeRequestAccesss: string = '[data-testid=doneAcceptRequest]'

  clickOnGenerateSecretButton() {
    cy.get(this.generateSecretsBtn).click()
  }

  saveAPIKeyValue(): void {
    cy.get(this.apiKyeValueTxt).invoke('val').then(($apiKey: any) => {
      cy.saveState('apikey', $apiKey)
    })
    cy.get(this.closeRequestAccesss).click()
  }

  saveClientCredentials(): void {
    cy.get(this.clientId).invoke('val').then(($clientId: any) => {
      cy.get(this.clientSecret).invoke('val').then(($clientSecret: any) => {
        cy.get(this.tokenEndpoint).invoke('val').then(($tokenEndpoint: any) => {
          cy.saveState(
            'clientidsecret',
            '{"clientId": "' +
              $clientId +
              '", "clientSecret": "' +
              $clientSecret +
              '", "tokenEndpoint": "' +
              $tokenEndpoint +
              '"}'
          )
        })
      })
    })
    cy.get(this.closeRequestAccesss).click()
  }

  saveJwtKeyPairCredentials(): void {
    cy.get(this.clientId).invoke('val').then(($clientId:any) => {
      cy.get(this.privateKey).invoke('val').then(($privateKey:any) => {
        cy.get(this.publicKey).invoke('val').then(($publicKey:any) => {
          cy.get(this.tokenEndpoint).invoke('val').then(($tokenEndpoint:any) => {
            cy.saveState(
              'jwtkeypaircredentials',
              '{"clientId": "' +
                $clientId +
                '", "tokenEndpoint": "' +
                $tokenEndpoint +
                '"}'
            )
            cy.writeFile('cypress/fixtures/state/jwtGenPrivateKey.pem', $privateKey)
            cy.writeFile('cypress/fixtures/state/jwtGenPublicKey.pub', $publicKey)
          })
        })
      })
    })
    cy.get(this.closeRequestAccesss).click()
  }

  saveJwksUrlCredentials(): void {
    cy.get(this.clientId).invoke('val').then(($clientId:any) => {
      cy.get(this.issuer).invoke('val').then(($issuer:any) => {
        cy.get(this.tokenEndpoint).invoke('val').then(($tokenEndpoint:any) => {
          cy.saveState(
            'jwksurlcredentials',
            '{"clientId": "' +
            $clientId +
            '", "issuer": "' +
            $issuer +
            '", "tokenEndpoint": "' +
            $tokenEndpoint +
            '"}'
          )
        })
      })
    })
    cy.get(this.closeRequestAccesss).click()
  }
}

export default myAccessPage
