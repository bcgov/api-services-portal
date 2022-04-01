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
  catelogueDropDown: string = '[id=downshift-0-input]'
  catelogueDropDownMenu: string = '[id=downshift-0-menu]'
  deleteProductEnvBtn: string = '[data-testid="prd-env-delete-btn"]'
  deleteProductBtn: string = '[data-testid="prd-edit-delete-btn"]'
  deleteConfirmationBtn: string = '[data-testid="delete-env-confirmation-btn"]'
  deleteProductConfirmationBtn: string = '[data-testid="confirm-delete-product-btn"]'

  getTestIdEnvName(env: string) : string {
    switch (env) {
      case "Development":
        return "dev"
      case "Production":
        return "prod"
      default:
        return env.toLowerCase()
    }
  }

  createNewProduct(productName: string, env: string) {
    cy.get(this.newProductBtn).click()
    cy.get(this.productNameInput).type(productName)
    cy.get(`[data-testid=prd-env-${env}-radio]`).click()
    cy.get(this.createBtn).click()
  }

  editProduct(productName: string) {
    const pname: string = productName.toLowerCase().replaceAll(' ', '-')
    cy.get(`[data-testid=${pname}-edit-btn]`).first().click()
    // cy.get(this.updateBtn).click()
  }

  updateOrg(orgName: string, orgUnitName: string) {
    cy.get(this.orgDropDown).select(orgName)
    cy.get(this.orgUnitDropDown).select(orgUnitName)
    cy.get(this.updateBtn).click()
  }

  addEnvToProduct(productName: string, envName: string) {
    let pname: string = productName.toLowerCase().replaceAll(' ', '-')
    let env = this.getTestIdEnvName(envName);
    cy.get(`[data-testid=${pname}-add-env-btn]`).click()
    cy.get(`[data-testid=${pname}-prd-env-item-${env}]`).click()
  }

  editProductEnvironment(productName: string, envName: string) {
    const pname: string = productName.toLowerCase().replaceAll(' ', '-')
    let env = this.getTestIdEnvName(envName);
    cy.get(`[data-testid=${pname}-${env}-edit-btn]`).click()
  }

  editProductEnvironmentConfig(config: any) {
    
    cy.get(this.editPrdEnvConfigBtn).click()
    cy.get(this.envCfgActivateRadio).click()
    // cy.get(this.envCfgApprovalCheckbox).click()

    cy.get(this.envCfgTermsDropdown).select(config.terms, { force: true }).invoke('val')

    let authType = config.authorization
    cy.get(this.envCfgAuthzDropdown)
      .select(authType, { force: true }).invoke('val')
      .then(() => {

        if (
          authType === 'Oauth2 Authorization Code Flow' ||
          authType === 'Oauth2 Client Credentials Flow'
        ) {
          let env = this.getTestIdEnvName(config.authIssuerEnv)
          cy.get('[name="credentialIssuer"]').select(
            `${config.authIssuer} (${env})`
          )
        }
          
      })

    cy.get(this.envCfgOptText).type(config.optionalInstructions)
    cy.get(`[data-testid=${config.serviceName}`).click()
    cy.wait(120000)
    cy.get(this.envCfgApplyChangesBtn).click()
  }

  generateKongPluginConfig(filename: string) {
    cy.get('.language-yaml').then(($el) => {
      cy.log($el.text())
      cy.readFile('cypress/fixtures/' + filename).then((content) => {
        let pluginFilename = filename.replace('.', '-plugin.')
        cy.writeFile('cypress/fixtures/' + pluginFilename, content + '\n' + $el.text())
      })
    })
  }

  updateDatasetNameToCatelogue(productName: string, env: string) {
    this.editProduct(productName)
    const search_input: string = productName.slice(0, 1)
    cy.get(this.catelogueDropDown).type(search_input + '{enter}', {
      force: true,
    })
    cy.get(this.catelogueDropDownMenu)
      .find('div')
      .find('p')
      .each(($e1, index, $list) => {
        if ($e1.text() === productName) {
          cy.wrap($e1).click()
        }
      })
    this.updateProduct()
  }

  updateProduct() {
    cy.get(this.updateBtn).click()
  }

  deleteProductEnvironment(productName: string, envName: string){
    const pname: string = productName.toLowerCase().replaceAll(' ', '-')
    let env = this.getTestIdEnvName(envName);
    cy.get(`[data-testid=${pname}-${env}-edit-btn]`).siblings(this.deleteProductEnvBtn).click()
    cy.get(this.deleteConfirmationBtn).click()
  }

  deleteProduct(productName: string){
    this.editProduct(productName)
    cy.get(this.deleteProductBtn).click()
    cy.get(this.deleteProductConfirmationBtn).click()
  }
}

export default Products
