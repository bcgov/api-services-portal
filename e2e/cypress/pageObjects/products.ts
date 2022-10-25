import { checkElementExists } from "../support"

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
  editPrdEnvConfigBtn: string = '[data-testid="edit-env-active-checkbox"]'
  // envCfgActivateRadio: string = '[data-testid=prd-env-config-activate-radio]'
  envCfgActivateRadio: string = '[name="active"]'
  envCfgApprovalCheckbox: string = '[data-testid="edit-env-approval-checkbox"]'
  envCfgTermsDropdown: string = '[data-testid=legal-terms-dd]'
  envCfgOptText: string = '[data-testid=edit-env-additional-details-textarea]'
  envCfgAuthzDropdown: string = '[data-testid=edit-env-auth-flow-select]'
  envCfgApplyChangesBtn: string = '[data-testid=edit-env-submit-button]'
  envCfgApplyChangesContinueBtn: string = '[data-testid=edit-env-continue-button]'
  catelogueDropDown: string = '[id=downshift-0-input]'
  catelogueDropDownMenu: string = '[id=downshift-0-menu]'
  deleteProductEnvBtn: string = '[data-testid="prd-env-delete-btn"]'
  deleteProductBtn: string = '[data-testid="prd-edit-delete-btn"]'
  deleteConfirmationBtn: string = '[data-testid="delete-env-confirmation-btn"]'
  deleteProductConfirmationBtn: string = '[data-testid="confirm-delete-product-btn"]'
  aclSwitch: string = '[data-testid="acls-switch"]'
  viewTemplateBtn: string = '[data-testid="edit-env-view-plugin-template-btn"]'
  configServiceTab: string = '[data-testid="edit-env-configure-services-tab"]'
  config: string | undefined

  getTestIdEnvName(env: string): string {
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
    cy.verifyToastMessage("Product " + productName + " created")
  }

  editProduct(productName: string) {
    const pname: string = productName.toLowerCase().replaceAll(' ', '-')
    cy.get(`[data-testid=${pname}-more-options-btn]`).first().click()
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

  editProductEnvironmentConfig(config: any, invalid = false) {

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
    cy.get(this.envCfgApprovalCheckbox).click()
    cy.get(this.editPrdEnvConfigBtn).click()
    cy.wait(3000)
    cy.get(this.envCfgApplyChangesContinueBtn).click()
    cy.get(this.envCfgApplyChangesBtn).click()
    cy.wait(3000)
    if (invalid) {
      // cy.verifyToastMessage("Environment updated")
    }
    else {
      cy.verifyToastMessage("Success")
    }
  }

  generateKongPluginConfig(productName: string, envName: string, filename: string, flag?: boolean) {
    this.editProductEnvironment(productName, envName)
    cy.get(this.viewTemplateBtn).click()
    cy.get('.language-yaml').then(($el) => {
      cy.log($el.text())
      cy.readFile('cypress/fixtures/' + filename).then((content: any) => {
        let pluginFilename = filename.replace('.', '-plugin.')
        if (flag) {
          let subString = content.split('v0')
          cy.writeFile('cypress/fixtures/' + pluginFilename, subString[0] + 'v0' + '\n' + this.config + '\n' + subString[1] + 'v0' + '\n' + $el.text())
        }
        else {
          cy.writeFile('cypress/fixtures/' + pluginFilename, content + '\n' + $el.text())
        }
      })
    })
    cy.contains('Close').click()
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

  deleteProductEnvironment(productName: string, envName: string) {
    const pname: string = productName.toLowerCase().replaceAll(' ', '-')
    let env = this.getTestIdEnvName(envName);
    cy.get(`[data-testid=${pname}-${env}-more-options-btn]`).click()
    cy.get(`[data-testid=${pname}-${env}-delete-btn]`).click()
    cy.get(this.deleteConfirmationBtn).click()
  }

  deleteProduct(productName: string) {
    // this.editProduct(productName)
    const pname: string = productName.toLowerCase().replaceAll(' ', '-')
    cy.get(`[data-testid=${pname}-edit-btn]`).first().click({force: true})
    cy.get(`[data-testid=${pname}-delete-btn]`).first().click({force: true})
    cy.get(this.deleteProductConfirmationBtn).click()
  }

  verifyProductIsVisible(productName: string) {
    cy.get(`[data-testid=${productName}-edit-btn]`).should('exist')
  }

  turnOnACLSwitch(flag: Boolean) {
    cy.get(this.aclSwitch).find('input').then(($btn) => {
      if ($btn.is(':checked') != flag) {
        cy.wrap($btn).invoke('show')
        cy.wrap($btn).click({ force: true })
        cy.wait(3000)
      }
    })
  }

  activateService(productName: string, envName: string, config: any) {
    this.editProductEnvironment(productName, envName)
    cy.wait(2000)
    cy.get(this.configServiceTab).click()
    cy.wait(2000)
    cy.get(`[data-testid=${config.serviceName}`).click()
    cy.get(this.envCfgApplyChangesBtn).click()
  }

  getKongPluginConfig(productName: string, envName: string) {
    this.editProductEnvironment(productName, envName)
    cy.get(this.viewTemplateBtn).click()
    cy.get('.language-yaml').then(($el) => {
      this.config = $el.text()
      cy.wait(1000)
    })
    cy.contains('Close').click()
  }
}

export default Products
