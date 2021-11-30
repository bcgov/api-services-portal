class Products {
  path: string = '/manager/products'
  newProductBtn: string = '[data-testid=prds-new-btn]'
  productNameInput: string = '[data-testid=prd-name-input]'
  createBtn: string = '[data-testid=prd-create-btn]'
  editProductBtn: string = '[data-testid=prd-edit-btn]'
  editProductEnvBtn: string = '[data-testid=prd-env-edit-btn]'
  orgDropDown: string = '[data-testid=prd-edit-org-dd]'
  orgUnitDropDown: string = '[data-testid=prd-edit-org-unit-dd]'
  updateBtn: string = '[data-testid=prd-edit-update-btn]'
  editPrdEnvConfigBtn: string = '[data-testid=prd-env-config-edit-btn]'
  envCfgActivateRadio: string = '[data-testid=prd-env-config-activate-radio]'
  envCfgApprovalCheckbox: string = '[data-testid=prd-env-config-approval-checkbox]'
  envCfgTermsDropdown: string = '[data-testid=legal-terms-dd]'
  envCfgOptText: string = '[data-testid=prd-env-config-optional-text]'
  envCfgAuthzDropdown: string = '[data-testid=prd-env-config-authz-dd]'
  envCfgApplyChangesBtn: string = '[data-testid=prd-env-config-apply-btn]'

  createNewProduct(productName: string, env: string) {
    cy.get(this.newProductBtn).click()
    cy.get(this.productNameInput).type(productName)
    cy.get(`[data-testid=prd-env-${env}-radio]`).click()
    cy.get(this.createBtn).click()
  }

  editProduct(productName: string, orgName: string, orgUnitName: string) {
    const pname: string = productName.toLowerCase().replaceAll(' ', '-')
    cy.get(`[data-testid=${pname}-edit-btn]`).first().click()
    cy.get(this.orgDropDown).select(orgName)
    cy.get(this.orgUnitDropDown).select(orgUnitName)
    cy.get(this.updateBtn).click()
  }

  addEnvToProduct(productName: string, envName: string) {
    let pname: string = productName.toLowerCase().replaceAll(' ', '-')
    cy.get(`[data-testid=${pname}-add-env-btn]`).click()
    cy.get(`[data-testid=${pname}-prd-env-item-${envName.toLowerCase()}]`).click()
  }

  editProductEnvironment(productName: string, envName: string) {
    const pname: string = productName.toLowerCase().replaceAll(' ', '-')
    cy.log('pname = ' + pname)
    cy.get(`[data-testid=${pname}-${envName}-edit-btn]`).click()
    cy.log('Editing product env')
  }

  editProductEnvironmentConfig(config: any) {
    
    cy.get(this.editPrdEnvConfigBtn).click()

    let envEnabled = document
      .querySelector('[data-testid="prd-env-config-activate-radio"]')
      ?.getElementsByClassName('chakra-switch__track')[0]
      .hasAttribute('data-checked')

    if (!config.environmentEnabled != !envEnabled)
      cy.get(this.envCfgActivateRadio).click()

    let approvalRequired = document
      .querySelector('[data-testid="prd-env-config-approval-checkbox"]')
      ?.getElementsByClassName('chakra-checkbox__control')[0]
      .hasAttribute('data-active')

    if (!config.approvalRequired != !approvalRequired)
      cy.get(this.envCfgApprovalCheckbox).click()

    // cy.get(this.envCfgActivateRadio).click()
    // cy.get(this.envCfgApprovalCheckbox).click()
    cy.get(this.envCfgTermsDropdown).select(config.terms)

    let authType = config.authorization;
    cy.get(this.envCfgAuthzDropdown).select(authType).then(() => {
      if (authType === "Oauth2 Authorization Code Flow" || authType === "Oauth2 Client Credentials Flow")
      cy.get('[name="credentialIssuer"]').select(`${config.authIssuer} (${config.authIssuerEnv.toLowerCase()})`);
    })
    
    cy.get(this.envCfgOptText).type(config.optionalInstructions)

    // TODO: Selecting available services might need to be refined
    let serviceIsActive = document
      .querySelector('[data-testid="prd-env-active-services"]')
      ?.querySelector(`[data-testid="${config.serviceName}"]`)

    if (!config.serviceName != !serviceIsActive)
      cy.get(`[data-testid="${config.serviceName}"]`).click()

    // cy.get(`[data-testid="${config.serviceName}"]`).click() //Adding service to list of active services
    cy.get(this.envCfgApplyChangesBtn).click()
  }

  generateKongPluginConfig() {
    cy.get('.language-yaml').then(($el) => {
      cy.log($el.text())
      cy.readFile('cypress/fixtures/service.yml').then((content) => {
        cy.writeFile('cypress/fixtures/service-plugin.yml', content + '\n' + $el.text())
      })
    })
  }
}

export default Products
