class ServiceAccountsPage {
  path: string = '/manager/service-accounts'
  shareBtn: string = '[data-testid=sa-scopes-share-btn]'
  newServiceAccountBtn: string = '[data-testid=sa-create-second-btn]'
  clientId: string = '[data-testid=sa-new-creds-client-id]'
  clientSecret: string = '[data-testid=sa-new-creds-client-secret]'


  createServiceAccount(scopes: string[]): void {
    cy.get(this.newServiceAccountBtn).first().click()
    this.selectPermissions(scopes)
    cy.get(this.shareBtn).click()
  }

  checkClientCredentialsVisible() {
    cy.get(this.clientId).should('be.visible');
    cy.get(this.clientSecret).should('be.visible');
    cy.get(this.tokenEndpoint).should('be.visible');
  }

  saveServiceAcctCreds(): void {
    cy.get(this.clientId).then(($clientId) => {
      cy.get(this.clientSecret).then(($clientSecret) => {
        cy.saveState(
          'credentials',
          '{"clientId": "' +
            $clientId.text() +
            '", "clientSecret": "' +
            $clientSecret.text() +
            '"}'
        )
      })
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

  selectPermissions(scopes: string[]): void {
    scopes.forEach((scope) => {
      cy.contains(scope).click()
    })
  }
}

export default ServiceAccountsPage
