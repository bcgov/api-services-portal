class myAccessPage {
  generateSecretsBtn: string = '[data-testid=access-rqst-gen-scrts-btn]'
  apiKyeValueTxt: string = '[data-testid=sa-new-creds-api-key]'
  clientId: string = '[data-testid=sa-new-creds-client-id]'
  clientSecret: string = '[data-testid=sa-new-creds-client-secret]'
  tokenEndpoint: string = '[data-testid=sa-new-creds-token-endpoint]'
  privateKey: string = '[data-testid=sa-new-creds-signing-private-key]'
  publicKey: string = '[data-testid=sa-new-creds-signing-public-certificate]'
  issuer: string = '[data-testid=sa-new-creds-issuer]'
  

  clickOnGenerateSecretButton() {
    cy.get(this.generateSecretsBtn).click()
  }

  saveAPIKeyValue(): void {
    cy.get(this.apiKyeValueTxt).then(($apiKey) => {
      cy.saveState('apikey', $apiKey.text())
    })
  }

  saveClientCredentials(): void {
    cy.get(this.clientId).then(($clientId) => {
      cy.get(this.clientSecret).then(($clientSecret) => {
        cy.get(this.tokenEndpoint).then(($tokenEndpoint) => {
          cy.saveState(
            'clientidsecret',
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

<<<<<<< HEAD
  saveJwtKeyPairCredentials(): void {
=======
  saveJwksCredentials(): void {
>>>>>>> 56672ed1 (Divvies up jwk tests; work on generating, saving keys for jwk)
    cy.get(this.clientId).then(($clientId) => {
      cy.get(this.privateKey).then(($privateKey) => {
        cy.get(this.publicKey).then(($publicKey) => {
          cy.get(this.tokenEndpoint).then(($tokenEndpoint) => {
            cy.saveState(
<<<<<<< HEAD
              'jwtkeypaircredentials',
              '{"clientId": "' +
                $clientId.text() +
=======
              'jwksCredentials',
              '{"clientId": "' +
                $clientId.text() +
                '", "privateKey": "' +
                $privateKey.text() +
                '", "publicKey": "' +
                $publicKey.text() +
>>>>>>> 56672ed1 (Divvies up jwk tests; work on generating, saving keys for jwk)
                '", "tokenEndpoint": "' +
                $tokenEndpoint.text() +
                '"}'
            )
<<<<<<< HEAD
            cy.writeFile('cypress/fixtures/state/jwtGenPrivateKey.pem', $privateKey.text())
            cy.writeFile('cypress/fixtures/state/jwtGenPublicKey.pub', $publicKey.text())
=======
>>>>>>> 56672ed1 (Divvies up jwk tests; work on generating, saving keys for jwk)
          })
        })
      })
    })
  }

<<<<<<< HEAD
  saveJwksUrlCredentials(): void {
    cy.get(this.clientId).then(($clientId) => {
      cy.get(this.issuer).then(($issuer) => {
        cy.get(this.tokenEndpoint).then(($tokenEndpoint) => {
          cy.saveState(
            'jwksurlcredentials',
            '{"clientId": "' +
            $clientId.text() +
            '", "issuer": "' +
            $issuer.text() +
            '", "tokenEndpoint": "' +
            $tokenEndpoint.text() +
            '"}'
          )
        })
      })
    })
  }
=======
>>>>>>> 56672ed1 (Divvies up jwk tests; work on generating, saving keys for jwk)
}

export default myAccessPage
