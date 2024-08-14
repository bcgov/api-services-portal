
class ApiDirectoryPage {
  path: string = '/devportal/api-directory'
  yourProductsPath: string = '/devportal/api-directory/your-products'
  rqstAccessBtn: string = '[data-testid=request-access-button]'
  appSelect: string = '[data-testid=access-application-select]'
  additionalNotes: string = '[data-testid=access-rqst-add-notes-text]'
  submitBtn: string = '[data-testid=access-request-submit-button]'
  generateSecretsBtn: string = '[data-testid=access-rqst-gen-scrts-btn]'
  clientIdField: string = '[data-testid=sa-new-creds-client-id]';
  clientSecretField: string = '[data-testid=sa-new-creds-client-secret]';
  tokenEndpointField: string = '[data-testid=sa-new-creds-token-endpoint]';
  acceptTermsBtn: string = '[data-testid=access-rqst-legal-terms-cb]';
  // jwksUrlField: string = '[data-testid=access-rqst-jwks-url]';
  jwksUrlField: string = '[name=jwksUrl]';
  legatTermCheckBox: string = '[data-testid=acceptLegalTerm]';
  jwksURLField: string = '[name=jwksUrl]'
  orgDropDown: string = '[data-testid="orgDropDown"]'
  orgUnitDropDown: string = '[data-testid="orgUnitDropDown"]'
  addOrganizationBtn: string = '[data-testid="addOrganizationBtn"]'
  jwksPublicKeyCheckBox: string = '[data-testid="access-rqst-app-env-public-key"]'


  createAccessRequest(product: any, app: any, accessRqst: any, elevatedAccess?: boolean) {
    cy.contains('a', product.name, { timeout: 10000 }).should('be.visible');
    cy.contains(product.name).click()
    if (elevatedAccess) {
      cy.contains('For elevated access, please request acces').should('be.visible');
    }
    cy.get(this.rqstAccessBtn).click()
    cy.get(this.appSelect).select(app.name)
    cy.get('[data-testid=access-rqst-app-env-' + product.environment + ']').click()

    cy.get('body', { log: false }).then(($body) => {
      if ($body.find(this.legatTermCheckBox).length > 0) {
        cy.get(this.legatTermCheckBox).first().click()
      }
    })

    cy.get('body', { log: false }).then(($body) => {
      if (product.authProfile != 'undefined' && product.authProfile == 'jwksUrl') {
        cy.get('[data-testid="access-rqst-app-env-jwks-url"]').click()
        cy.get(this.jwksUrlField).click().type(Cypress.env('JWKS_URL'))
      }
      else if (product.authProfile != 'undefined' && product.authProfile == 'jwksPublicKey') {
        cy.readFile('cypress/fixtures/state/jwtReGenPublicKey_new.pub').then((publicKeyKey) => {
          cy.get('[data-testid="access-rqst-app-env-public-key"]').click()
          cy.get('[name="clientCertificate"]').invoke('val',publicKeyKey)
        })
      }
    })

    // cy.document().then((doc) => {
    //   if (doc.querySelector(this.jwksUrlField)) {
    //     cy.get(this.jwksUrlField).click().type(Cypress.env('JWKS_URL'))
    //   }
    // })
    cy.get(this.additionalNotes).type(accessRqst.notes)
    cy.get(this.submitBtn).click()
  }

  checkInactiveEnvironmentAccessReqOption(product: any, app: any){
    cy.contains('a', product.name, { timeout: 10000 }).should('be.visible');
    cy.contains(product.name).click()
    cy.get(this.rqstAccessBtn).click()
    cy.get(this.appSelect).select(app.name)
    cy.get('[data-testid=access-rqst-app-env-' + product.environment + ']').should('not.exist');
  }

  isProductDisplay(productName: string, expResult: boolean) {
    cy.get("button").then(($btn) => {
      var flag = true
      cy.wait(2000)
      const pname: string = productName.toLowerCase().replaceAll(' ', '-')
      let ele: string = `[data-testid=api-${pname}]`
      Cypress.on('uncaught:exception', (err, runnable) => {
        cy.get(ele).click()
        return false
      })
      assert.equal(flag, expResult)
    })
  }

  navigateToYourProduct() {
    cy.contains("Your Products").click()
    cy.wait(3000)
  }

  selectProduct(productName: string) {
    const pname: string = productName.toLowerCase().replaceAll(' ', '-')
    var ele: string = `[data-testid=api-${pname}]`
    cy.get(ele).click()
  }

  isEnvironmentDisplayInAPIDirectory(productconfig: any, flag: boolean) {
    cy.get("[data-testid^='discovery-item']").find('a').each(($el, index, $list) => {
      let productName = $el.text()
      cy.log(productName)
      if (productName === productconfig.name) {
        cy.get(`[data-testid^=discovery-item-${index}]`).find('li').find('span').each(($el) => {
          let envName = $el.text()
          if (envName === productconfig.environment.name) {
            assert.isTrue(flag, "Environment displays")
          }
        })
      }
    })
  }

  checkProductIcon(productName: string, expectedIcon: string) {
    const pname: string = productName.toLowerCase().replaceAll(' ', '-')
    var ele: string = `[data-testid=product-icon-${pname}-${expectedIcon}]`
    cy.get(ele).should('exist')
  }

  checkTwoTieredIcon(productName: string) {
    const pname: string = productName.toLowerCase().replaceAll(' ', '-')
    var ele: string = `[data-testid=two-tiered-icon-${pname}]`
    cy.get(ele).should('exist')
  }

  checkTwoTieredHiddenButton() {
    var ele: string = '[data-testid=request-access-button-two-tiered-hidden]'
    cy.get(ele).should('exist')
  }

  addOrganizationAndOrgUnit(product: any) {
    cy.contains('button', 'Add Organization').click({ force: true })
    cy.get(this.orgDropDown).select(product.orgName)
    cy.get(this.orgUnitDropDown).select(product.orgUnitName)
    cy.wait(1000)
    cy.get(this.addOrganizationBtn).click({ force: true })
  }

  checkOrgAdminNotificationBanner(notification: any, childMessage: string) {
    cy.get('[data-testid="org-assignment-notification-parent"]').invoke('text').then((text) => {
      text = this.getPlainText(text)
      assert.equal(text, notification)
      cy.contains('button', 'Learn More').click()
      cy.get('[data-testid="org-assignment-notification-child"]').invoke('text').then((text) => {
        text = this.getPlainText(text)
        assert.equal(text, childMessage)
      })
    })
  }

  getPlainText(text: string): string {
    return text.replace(/[\r\n]/g, '').replace(/\s+/g, " ")
  }

  enterInvalidJWTKey(product: any, app: any, accessRqst: any) {
    cy.contains(product.name).click()
    cy.get(this.rqstAccessBtn).click()
    cy.get(this.appSelect).select(app.name)
    cy.get('[data-testid=access-rqst-app-env-' + product.environment + ']').click()
    cy.get('body', { log: false }).then(($body) => {
      if ($body.find(this.legatTermCheckBox).length > 0) {
        cy.get(this.legatTermCheckBox).first().click()
      }
    })
    cy.readFile('cypress/fixtures/state/jwtReGenPublicKey_new.pub').then((publicKeyKey) => {
      cy.get(this.jwksPublicKeyCheckBox).click()
      cy.get('[name="clientCertificate"]').click().type(publicKeyKey + "End of File")
    })
    cy.get(this.additionalNotes).type(accessRqst.notes)
    cy.get(this.submitBtn).click()
  }
}

export default ApiDirectoryPage
