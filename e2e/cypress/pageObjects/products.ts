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
    cy.get(`[data-testid=${pname}-add-env-btn]`).click()
    cy.get(`[data-testid=${pname}-prd-env-item-${envName.toLowerCase()}]`).click()
  }

  editProductEnvironment(productName: string, envName: string) {
    const pname: string = productName.toLowerCase().replaceAll(' ', '-')
    cy.get(`[data-testid=${pname}-${envName}-edit-btn]`).click()
  }

  editProductEnvironmentConfig(config: any) {
    cy.get(this.editPrdEnvConfigBtn).click()
    cy.get(this.envCfgActivateRadio).click()
    cy.get(this.envCfgApprovalCheckbox).click()

    cy.get(this.envCfgTermsDropdown).select(config.terms)

    let authType = config.authorization
    cy.get(this.envCfgAuthzDropdown)
      .select(authType)
      .then(() => {
        if (
          authType === 'Oauth2 Authorization Code Flow' ||
          authType === 'Oauth2 Client Credentials Flow'
        )
          cy.get('[name="credentialIssuer"]').select(
            `${config.authIssuer} (${config.authIssuerEnv.toLowerCase()})`
          )
      })

    cy.get(this.envCfgOptText).type(config.optionalInstructions)

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
}

export default Products
