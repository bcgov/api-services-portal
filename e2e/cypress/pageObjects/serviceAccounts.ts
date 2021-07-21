class ServiceAccountsPage {
  path: string = '/manager/namespaces'
  shareButton: string = "//button[normalize-space()='Share']"

  clientId: string =
    '/html[1]/body[1]/div[1]/main[1]/div[1]/div[2]/div[3]/div[1]/div[1]/code'

  clientSecret: string =
    '/html[1]/body[1]/div[1]/main[1]/div[1]/div[2]/div[3]/div[2]/div[1]/code'

  createServiceAccount(scopes: string[]): void {
    cy.contains('New Service Account').click()
    scopes.forEach((scope) => {
      cy.contains(scope).click()
    })
    cy.xpath(this.shareButton).click()
  }

  saveServiceAcctCreds(): void {
    cy.xpath(this.clientId).then(($clientId) => {
      cy.xpath(this.clientSecret).then(($clientSecret) => {
        cy.saveState(
          'credentials',
          "{'clientId': '" +
            $clientId.text() +
            "', 'clientSecret': '" +
            $clientSecret.text() +
            "'}"
        )
      })
    })
  }
}

export default ServiceAccountsPage
