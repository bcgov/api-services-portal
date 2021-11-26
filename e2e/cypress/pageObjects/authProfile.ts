class AuthorizationProfile {
  path: string = '/manager/authorization-profiles'
  newProfileBtn: string = '[data-testid="create-new-auth-profile-btn"]'
  nameField: string = '[data-testid="ap-profile-name"]'
  flow: string = '["ap-flow-select"]'
  kongApiKey: string = '["ap-api-key"]'
  clientAuthenticator: string = '["ap-client-aunthenticator"]'
  mode: string = '["ap-mode"]'
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

    cy.log("Create Auth Profile")

    cy.get(this.newProfileBtn).click();

    cy.log(authProfile)

    // cy.get(this.nameField).click().type(authProfile.name);

    // let flow = authProfile.flow;

    // cy.get(this.flow).select(flow);

    // if (flow === "Kong API Key") {
    //   cy.get(this.kongApiKey).type(authProfile.apiKey)
    
    // } else if (flow === "Client Credential Flow") {
    //   cy.get(this.clientAuthenticator).select(authProfile.clientAuthenticator);
      
    //   if (authProfile.mode) cy.get(this.mode).select(authProfile.mode);

    //   if (authProfile.scopes) {
    //     authProfile.scopes.forEach((s: string) => {
    //       cy.get(this.scopes).click().type(`${s}{enter}`)
    //     })
    //   }

    //   if (authProfile.clientRoles) {
    //     authProfile.clientRoles.forEach((cr: string) => {
    //       cy.get(this.clientRoles).click().type(`${cr}{enter}`)
    //     })
    //   }

    //   if (authProfile.clientMappers) cy.get(this.clientMappers).click().type(authProfile.clientMappers)

    //   if (authProfile.uma2ResourceType) cy.get(this.uma2ResourceType).click().type(authProfile.uma2ResourceType)

    //   if (authProfile.resourceScopes) {
    //     authProfile.resourceScopes.forEach((rs: string) => {
    //       cy.get(this.resourceScopes).click().type(`${rs}{enter}`)
    //     })
    //   }

    //   if (authProfile.resourceAccessScope) cy.get(this.resourceAccessScope).type(authProfile.resourceAccessScope)

    //   if (authProfile.environmentConfig) {
    //     cy.get(this.addEnvBtn).click()

    //     if (authProfile.environmentConfig.environment) cy.get(this.envSelector).select(authProfile.environmentConfig.environment)

    //     let clientReg = authProfile.environmentConfig.clientRegistration;

    //     cy.get(this.clientRegistration).select(clientReg);

    //     if (clientReg === "Initial Access Token") cy.get(this.initAccessToken).click().type(authProfile.environmentConfig.initAccessToken)
        
    //     if (clientReg === "Managed") {
    //       cy.get(this.clientId).click().type(authProfile.environmentConfig.clientId);
    //       cy.get(this.clientSecret).click().type(authProfile.environmentConfig.clientSecret);
    //     }

    //     cy.get(this.envAddBtn).click();
    //   }
    // }

    // // cy.get(this.createBtn).click();
  }
}
  
export default AuthorizationProfile;