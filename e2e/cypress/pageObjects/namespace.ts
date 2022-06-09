class NameSpacePage {
    path: string = '/manager/namespaces'
    gatewayServiceLink: string = '[data-testid="ns-manage-link-Gateway Services"]'
    productsLink: string = '[data-testid="ns-manage-link-Gateway Services"]'
    consumersLink: string = '[data-testid="ns-manage-link-Consumers"]'
    activityLink: string = '[data-testid="ns-action-link-Activity"]'
    authorizationProfileLink: string = '[data-testid="ns-action-link-Authorization Profiles"]'
    namespaceAccessLink: string = '[data-testid="ns-action-link-Namespace Access"]'
    serviceAccountsLink: string = '[data-testid="ns-action-link-Service Accounts"]'
    deleteNamespaceLink: string = '[data-testid="ns-action-link-delete"]'
    
    verifyThatOnlyAuthorizationProfileLinkIsExist()
    {
        cy.get(this.gatewayServiceLink).should('not.exist')
        cy.get(this.productsLink).should('not.exist')
        cy.get(this.consumersLink).should('not.exist')
        cy.get(this.activityLink).should('not.exist')
        cy.get(this.authorizationProfileLink).should('exist')
        cy.get(this.namespaceAccessLink).should('not.exist')
        cy.get(this.serviceAccountsLink).should('not.exist')
        cy.get(this.deleteNamespaceLink).should('not.exist')
    }

    verifyThatAllOptionsAreDisplayed()
    {
        cy.get(this.gatewayServiceLink).should('exist')
        cy.get(this.productsLink).should('exist')
        cy.get(this.consumersLink).should('exist')
        cy.get(this.activityLink).should('exist')
        cy.get(this.authorizationProfileLink).should('exist')
        cy.get(this.namespaceAccessLink).should('exist')
        cy.get(this.serviceAccountsLink).should('exist')
        cy.get(this.deleteNamespaceLink).should('exist')
    }

    deleteNamespace(name: string) {
        cy.get(this.deleteNamespaceLink).click()
        cy.contains('button', 'Yes, Delete').click()
      }
}

export default NameSpacePage