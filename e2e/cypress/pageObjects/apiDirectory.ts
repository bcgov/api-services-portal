
class ApiDirectoryPage {
  path: string = '/devportal/api-directory'
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


  createAccessRequest(product: any, app: any, accessRqst: any) {
    cy.contains('a', product.name, { timeout: 10000 }).should('be.visible');
    cy.contains(product.name).click()
    cy.get(this.rqstAccessBtn).click()
    cy.get(this.appSelect).select(app.name)
    cy.get('[data-testid=access-rqst-app-env-' + product.environment + ']').click()

    cy.get('body', { log: false }).then(($body) => {
      if ($body.find(this.legatTermCheckBox).length > 0) {
        cy.get(this.legatTermCheckBox).first().click()
      }
    })

    cy.get('body', { log: false }).then(($body) => {
      if ($body.find(this.jwksUrlField).length > 0) {
        cy.get(this.jwksUrlField).click().type(Cypress.env('JWKS_URL'))
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
          if (envName === productconfig.environment.name ) {
            assert.isTrue(flag, "Environment displays")
          }
        })
      }
    })
  }

  addOrganizationAndOrgUnit(product: any) {
    cy.contains('button', 'Add Organization').click({ force: true })
    cy.get(this.orgDropDown).select(product.orgName)
    cy.get(this.orgUnitDropDown).select(product.orgUnitName)
    cy.wait(1000)
    cy.get(this.addOrganizationBtn).click({ force: true })
  }

  checkOrgAdminNotificationBanner(notification: any) {
    cy.get('[data-testid="org-assignment-notification-parent"]').invoke('text').then((text) => {
      text = this.getPlainText(text)
      assert.equal(text, notification.parent )
      cy.contains('button','Learn More').click()
      cy.get('[data-testid="org-assignment-notification-child"]').invoke('text').then((text) => {
        text = this.getPlainText(text)
        assert.equal(text, notification.child )
      })
    })
  }

  getPlainText(text :string): string{ 
    text = text.replace(/[\r\n]/g, '')
    text = text.replace(/\s+/g, " ")
    return text
  }
}

export default ApiDirectoryPage
