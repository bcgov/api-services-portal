class ServiceAccountsPage {
  path: string = '/manager/service-accounts'
  shareBtn: string = '[data-testid=sa-scopes-share-btn]'
  newServiceAccountBtn: string = '[data-testid=sa-create-second-btn]'
  clientId: string = '[data-testid=sa-new-creds-client-id]'
  clientSecret: string = '[data-testid=sa-new-creds-client-secret]'
  tokenEndpoint: string = '[data-testid=sa-new-creds-token-endpoint]'

  createServiceAccount(scopes: string[]): void {
    cy.get(this.newServiceAccountBtn).first().click()
    this.selectPermissions(scopes)
    cy.get(this.shareBtn).click()
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

  selectPermissions(scopes: string[]): void {
    scopes.forEach((scope) => {
      cy.contains(scope).click()
    })
  }
}

export default ServiceAccountsPage
