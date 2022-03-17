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

checkServiceAccountNotExist() : void
  {
    cy.get(this.newServiceAccountBtn).should('not.exist')
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

  isShareButtonVisible(expStatus : boolean) {
    var actStatus = false
    cy.get(this.shareBtn).then($button => {
      if ($button.is(':visible'))
        actStatus =true
      assert.strictEqual (actStatus,expStatus,"Share button status is other than expected status")
  })
}

  selectPermissions(scopes: string[]): void {
    scopes.forEach((scope) => {
      cy.contains(scope).click()
    })
  }
}

export default ServiceAccountsPage
