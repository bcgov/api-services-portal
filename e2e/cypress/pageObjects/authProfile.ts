class AuthorizationProfile {
  path: string = '/manager/authorization-profiles'
  newProfileBtn: string = '[data-testid="create-new-auth-profile-btn"]'
  profileTable: string = '[data-testid="ap-all-profiles-table"]'
  nameField: string = '[data-testid="ap-profile-name"]'
  flow: string = '[data-testid="ap-flow-select"]'
  kongApiKey: string = '[data-testid="ap-api-key"]'
  clientAuthenticator: string = '[data-testid="ap-client-aunthenticator"]'
  mode: string = '[data-testid="ap-mode"]'
  scopes: string = '[data-testid="ap-authorization-scopes"]'
  clientRoles: string = '[data-testid="ap-authorization-client-roles"]'
  clientMappers: string = '[data-testid="ap-authorization-client-mappers"]'
  uma2ResourceType: string = '[data-testid="ap-authorization-uma2-resource-type"]'
  resourceScopes: string = '[data-testid="ap-authorization-resource-scopes"]'
  resourceAccessScope: string = '[data-testid="ap-authorization-resource-access-scope"]'
  addEnvBtn: string = '[data-testid="ap-client-mgmt-add-env-btn"]'
  envSelector: string = '[data-testid="ap-env-env"]'
  clientRegistration: string = '[data-testid="ap-env-client-reg"]'
  idpIssuerUrl: string = '[data-testid="ap-env-idp-url"]'
  initAccessToken: string = '[data-testid="ap-env-init-token"]'
  clientId: string = '[data-testid="ap-env-client-id"]'
  clientSecret: string = '[data-testid="ap-env-client-secret"]'
  envAddBtn: string = '[data-testid="ap-env-add-btn"]'
  createBtn: string = '[data-testid="ap-create-btn"]'

  createAuthProfile(authProfile: any) {
    cy.get(this.newProfileBtn).click()
    cy.get(this.nameField).click().type(authProfile.name)

    let flow = authProfile.flow
    cy.get(this.flow).contains(flow).click()

    if (flow === 'Kong API Key') {
      cy.get(this.kongApiKey).type(authProfile.apiKey)
    } else if (flow === 'Client Credential Flow') {
      cy.get(this.clientAuthenticator).contains(authProfile.clientAuthenticator).click()

      if (authProfile.mode) cy.get(this.mode).contains(authProfile.mode).click()

      // TODO Currently not working. Unable to find '[data-testid="ap-authorization-scopes"]' ID
      if (authProfile.scopes) {
        authProfile.scopes.forEach((scope: string) => {
          cy.get(this.scopes).click().type(`${scope}{enter}`)
        })
      }

      // TODO test this. May not work, and have similar issue as "Scopes"
      if (authProfile.clientRoles) {
        authProfile.clientRoles.forEach((clientRole: string) => {
          cy.get(this.clientRoles).click().type(`${clientRole}{enter}`)
        })
      }

      if (authProfile.clientMappers)
        cy.get(this.clientMappers).click().type(authProfile.clientMappers)

      if (authProfile.uma2ResourceType)
        cy.get(this.uma2ResourceType).click().type(authProfile.uma2ResourceType)

      // TODO test this. May not work, and have similar issue as "Scopes"
      if (authProfile.resourceScopes) {
        authProfile.resourceScopes.forEach((resourceScope: string) => {
          cy.get(this.resourceScopes).click().type(`${resourceScope}{enter}`)
        })
      }

      if (authProfile.resourceAccessScope)
        cy.get(this.resourceAccessScope).type(authProfile.resourceAccessScope)

      if (authProfile.environmentConfig) {
        cy.get(this.addEnvBtn).click()

        if (authProfile.environmentConfig.environment)
          cy.get(this.envSelector)
            .contains(authProfile.environmentConfig.environment)
            .click()

        cy.get(this.idpIssuerUrl).click().type(authProfile.environmentConfig.idpIssuerUrl)

        let clientReg = authProfile.environmentConfig.clientRegistration

        cy.get(this.clientRegistration).contains(clientReg).click()

        if (clientReg === 'Initial Access Token')
          cy.get(this.initAccessToken)
            .click()
            .type(authProfile.environmentConfig.initAccessToken)

        if (clientReg === 'Managed') {
          cy.get(this.clientId).click().type(authProfile.environmentConfig.clientId)
          cy.get(this.clientSecret)
            .click()
            .type(authProfile.environmentConfig.clientSecret)
        }

        cy.get(this.envAddBtn).click()
      }
    }

    cy.get(this.createBtn).click()
  }
}

export default AuthorizationProfile
