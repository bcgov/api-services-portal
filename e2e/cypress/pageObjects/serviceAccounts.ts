class ServiceAccountsPage {
  path: string = '/manager/service-accounts'
  shareBtn: string = '[data-testid=sa-scopes-share-btn]'
  newServiceAccountBtn: string = '[data-testid=sa-create-second-btn]'
  clientId: string = '[data-testid=sa-new-creds-client-id]'
  clientSecret: string = '[data-testid=sa-new-creds-client-secret]'
  serviceAccountTbl: string = '[role="table"]'
  serviceAcctDeleteBtn: string = '[data-testid=service-account-delete-btn]'
  deleteServiceAcctConfirmationBtn: string = '[data-testid="confirm-delete-service-acct-btn"]'

  createServiceAccount(scopes: string[]): void {
    cy.get(this.newServiceAccountBtn).first().click()
    this.selectPermissions(scopes)
    cy.checkA11yIssue()
    cy.get(this.shareBtn).click()
    cy.wait(8000)
    cy.checkA11yIssue()
  }

  checkServiceAccountNotExist(): void {
    cy.get(this.newServiceAccountBtn).should('not.exist')
  }

  saveServiceAcctCreds(flag?: boolean): void {
    cy.get(this.clientId).invoke('val').then(($clientId) => {
      cy.get(this.clientSecret).invoke('val').then(($clientSecret) => {
        cy.saveState(
          'credentials',
          '{"clientId": "' +
          $clientId +
          '", "clientSecret": "' +
          $clientSecret +
          '"}', flag
        )
      })
    })
  }

  isShareButtonVisible(expStatus: boolean) {
    var actStatus = false
    cy.get(this.shareBtn).then($button => {
      if ($button.is(':visible'))
        actStatus = true
      assert.strictEqual(actStatus, expStatus, "Share button status is other than expected status")
    })
  }

  selectPermissions(scopes: string[]): void {
    scopes.forEach((scope) => {
      cy.contains(scope).click()
    })
  }

  deleteAllServiceAccounts() {
    cy.wait(2000)
    let namespaceText
    cy.get(this.serviceAccountTbl).find('tr').each(($e1, index, $list) => {
      namespaceText = $e1.find('td:nth-child(1)').text();
      cy.log('namespaceText --> '+namespaceText)
      if (namespaceText.startsWith('sa')) {
        cy.wrap($e1).find('button').first().click()
        cy.wrap($e1).find(this.serviceAcctDeleteBtn).first().click()
        cy.checkA11yIssue()
        cy.get(this.deleteServiceAcctConfirmationBtn).click()
      }
    })
  }

  deleteServiceAccount(clientId : string) {
    cy.wait(2000)
    let namespaceText
    cy.get(this.serviceAccountTbl).find('tr').each(($e1, index, $list) => {
      namespaceText = $e1.find('td:nth-child(1)').text();
      cy.log('namespaceText --> '+namespaceText)
      if (namespaceText===clientId) {
        cy.wrap($e1).find('button').first().click()
        cy.wrap($e1).find(this.serviceAcctDeleteBtn).first().click()
        cy.checkA11yIssue()
        cy.get(this.deleteServiceAcctConfirmationBtn).click()
        return false
      }
    })
  }
}

export default ServiceAccountsPage
