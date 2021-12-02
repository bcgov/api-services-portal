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
    // cy.get(this.newProductBtn).click()
    // cy.get(this.productNameInput).type(productName)
    // cy.get(`[data-testid=prd-env-${env}-radio]`).click()
    // cy.get(this.createBtn).click()
  }

  editProduct(productName: string, orgName: string, orgUnitName: string) {
    const pname: string = productName.toLowerCase().replaceAll(' ', '-')
    cy.get(`[data-testid=${pname}-edit-btn]`).first().click()
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
    cy.get(this.envCfgActivateRadio).click()
    cy.get(this.envCfgApprovalCheckbox).click()
    cy.get(this.envCfgTermsDropdown).select(config.terms,{ force: true }).invoke('val')
    cy.get(this.envCfgAuthzDropdown).select(config.authorization,{ force: true }).invoke('val')
    cy.get(this.envCfgOptText).type(config.optionalInstructions)
    cy.get(this.envCfgApplyChangesBtn).click()
    cy.wait(10000)
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
