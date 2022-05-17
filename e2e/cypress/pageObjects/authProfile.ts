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
  addEnvBtn: string = '[data-testid="ap-client-mgmt-add-env-Add Environment"]'
  envSelector: string = '[data-testid="cm-environment-dropdown"]'
  clientRegistration: string = '[data-testid="cm-client-registration-dropdown"]'
  idpIssuerUrl: string = '[data-testid="idp-issuer-url"]'
  initAccessToken: string = '[data-testid="ap-env-init-token"]'
  clientId: string = '[data-testid="cm-client-id"]'
  clientSecret: string = '[data-testid="cm-client-secret"]'
  envAddBtn: string = '[data-testid="ap-env-add-btn"]'
  createBtn: string = '[data-testid="ap-create-btn"]'
  continueBtn: string = '[data-testid="ap-profile-name-submit-btn"]'
  authenticationContinueBtn: string = '[data-testid="ap-authentication-form-continue-btn"]'
  authorizationContinueBtn: string = '[data-testid="ap-authorization-form-continue-btn"]'
  kongAPIKeyFlow: string = '[data-testid="kong-api-key-chkBox"]'
  clientCredentialFlow: string = '[data-testid="cc-id-secret-chkBox"]'


  createAuthProfile(authProfile: any, isCreated=true) {
    cy.get(this.newProfileBtn).first().click()
    cy.get(this.nameField).click().type(authProfile.name)
    cy.get(this.continueBtn).click()
    let flow = authProfile.flow

    if (flow === 'Kong API Key') {
      cy.get(this.kongAPIKeyFlow).click()
      cy.get(this.authenticationContinueBtn).click()
      cy.get(this.kongApiKey).type(authProfile.apiKey)
      cy.get(this.authenticationContinueBtn).click()
    } else if (flow === 'Client Credential Flow') {
      cy.get('[data-testid='+ authProfile.element + '-chkBox]').click()
      cy.get(this.authenticationContinueBtn).click()
      cy.get(this.authorizationContinueBtn).click()
      // cy.get(this.clientAuthenticator).contains(authProfile.clientAuthenticator).click()
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
            .select(authProfile.environmentConfig.environment)
            .invoke('val')

        cy.get(this.idpIssuerUrl).click().type(authProfile.environmentConfig.idpIssuerUrl)

        let clientReg = authProfile.environmentConfig.clientRegistration

        cy.get(this.clientRegistration).select(clientReg).invoke('val')

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
    cy.wait(2000)
    if (isCreated === true)
      cy.get(this.profileTable).contains(authProfile.name).should('exist')
    else
      cy.get(this.profileTable).should('not.exist')
  }
}

export default AuthorizationProfile
