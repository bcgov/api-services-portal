class ServiceAccountsPage {
  path: string = '/manager/namespaces'
  newServiceAccount: string =
    '/html/body/div[1]/main/div/div[2]/table/tbody/tr/td/div/div/div/button'
  shareButton: string = '/html/body/div[4]/div[4]/div/section/footer/div/button[2]'

  clientId: string =
    '/html[1]/body[1]/div[1]/main[1]/div[1]/div[2]/div[3]/div[1]/div[1]/code[1]'

  clientSecret: string =
    '/html[1]/body[1]/div[1]/main[1]/div[1]/div[2]/div[3]/div[2]/div[1]/code[1]'

  createServiceAccount(scopes: string[]): void {
    scopes.forEach((scope) => {
      cy.contains(scope).click()
    })
    cy.xpath(this.shareButton).click()
  }

  saveServiceAcctCreds(): void {
    cy.xpath(this.clientId).then(($clientId) => {
      cy.xpath(this.clientSecret).then(($clientSecret) => {
        cy.saveState($clientId.text(), $clientSecret.text())
      })
    })
  }
}

export default ServiceAccountsPage
