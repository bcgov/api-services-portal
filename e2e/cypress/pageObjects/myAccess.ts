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
  accessListTbl: string = '[data-testid=access-list-item-table]'
  regenerateCredentialBtn: string = '[data-testid=regenerate-credentials-btn]'
  regenerateCredentialCloseBtn: string = '[data-testid=regenerate-credentials-done-button]'
  collectCredentialsBtn: string = '[data-testid="generate-credentials-button"]'
  clientIDValueTxt: string = '[data-testid="sa-new-creds-client-id"]'
  path: string = '/devportal/access'


  clickOnGenerateSecretButton() {
    cy.get(this.generateSecretsBtn).click()
  }

  clickOnCollectCredentialButton() {
    cy.get(this.collectCredentialsBtn).click()
  }

  saveAPIKeyValue(): void {
    cy.get(this.apiKyeValueTxt).invoke('val').then(($apiKey: any) => {
      cy.saveState('apikey', $apiKey)
      cy.contains('Done').click()
    })
  }

  closeRequestAccessPopUp()
  {
    cy.get(this.closeRequestAccesss).click()
  }

  saveReGenAPIKeyValue(): void {
    cy.get(this.apiKyeValueTxt).invoke('val').then(($apiKey: any) => {
      cy.saveState('newApiKey', $apiKey)
    })
    cy.get(this.regenerateCredentialCloseBtn).click()
  }

  saveClientCredentials(flag?: boolean, isGlobal?:boolean): void {
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
            '"}', flag, isGlobal
          )
        })
      })
    })
    if(flag)
      cy.get(this.regenerateCredentialCloseBtn).click()
    else
      cy.get(this.closeRequestAccesss).click()
    cy.wait(1000)
  }

  saveClientCredentialsOnGlobalVariable(flag?: boolean): void {
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
            '"}', flag
          )
        })
      })
    })
    if(flag)
      cy.get(this.regenerateCredentialCloseBtn).click()
    else
      cy.get(this.closeRequestAccesss).click()
  }

  saveJwtKeyPairCredentials(flag?: boolean): void {
    cy.get(this.clientId).invoke('val').then(($clientId: any) => {
      cy.get(this.privateKey).invoke('val').then(($privateKey: any) => {
        cy.get(this.publicKey).invoke('val').then(($publicKey: any) => {
          cy.get(this.tokenEndpoint).invoke('val').then(($tokenEndpoint: any) => {
            cy.saveState(
              'jwtkeypaircredentials',
              '{"clientId": "' +
              $clientId +
              '", "tokenEndpoint": "' +
              $tokenEndpoint +
              '"}',flag
            )
            if(flag){
              cy.writeFile('cypress/fixtures/state/jwtReGenPrivateKey_new.pem', $privateKey)
              cy.writeFile('cypress/fixtures/state/jwtReGenPublicKey_new.pub', $publicKey)
              cy.get(this.regenerateCredentialCloseBtn).click()
            }
            else{
              cy.writeFile('cypress/fixtures/state/jwtGenPrivateKey.pem', $privateKey)
              cy.writeFile('cypress/fixtures/state/jwtGenPublicKey.pub', $publicKey)
              cy.get(this.closeRequestAccesss).click()
            }
          })
        })
      })
    })
  }

  saveJwksUrlCredentials(): void {
    cy.get(this.clientId).invoke('val').then(($clientId: any) => {
      cy.get(this.issuer).invoke('val').then(($issuer: any) => {
        cy.get(this.tokenEndpoint).invoke('val').then(($tokenEndpoint: any) => {
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

  regenerateCredential(env: string, appName: string): void {
    cy.get(this.accessListTbl).find('tr').each(($e1, index, $list) => {
      let applicationName = $e1.find('td:nth-child(3)').text()
      let environment = $e1.find('td:nth-child(2)').find('span').text()
      if (applicationName.toLowerCase() === appName.toLowerCase() && environment.toLowerCase() === env.toLowerCase()) {
        cy.wrap($e1).find('button').first().click()
        cy.get(this.regenerateCredentialBtn).filter(':visible').first().click()
      }
    })
  }

  checkRequestStatus(env: string, appName: string, requestStatus: string): void {
    cy.get(this.accessListTbl).find('tr').each(($e1, index, $list) => {
      let applicationName = $e1.find('td:nth-child(3)').text()
      let environment = $e1.find('td:nth-child(2)').find('span').text()
      if (applicationName.toLowerCase() === appName.toLowerCase() && environment.toLowerCase() === env.toLowerCase()) {
        assert.equal($e1.find('td:nth-child(1)').find('p').text(),requestStatus)
      }
    })
  }

  saveClientIDValue() {
    cy.get(this.clientIDValueTxt).invoke('val').then(($clientID: any) => {
      cy.saveState('clientID', $clientID)
    })
  }
}

export default myAccessPage
