import { Assertion } from "chai"
import { wrap } from "module"
import dateformat from 'dateformat'

export default class ConsumersPage {
  path: string = '/manager/consumers'
  rateLimitHourInput: string = '[data-testid="ratelimit-hour-input"]'
  ipRestrictionAllowInput: string = '[data-testid="allow-ip-restriction-input-input"]'
  removeIPRestrictionButton: string = '[data-testid="ip-restriction-item-delete-btn-0"]'
  policyDropDown: string = '[data-testid="ratelimit-policy-dropdown"]'
  applyBtn: string = '[data-testid="ip-restriction-submit-btn"]'
  pendingRequestTable: string = '[data-testid="pending-request-tbl"]'
  reviewBtn: string = '[data-testid="ar-review-btn"]'
  approveBtn: string = '[data-testid="ar-approve-btn"]'
  filterType: string = '[data-testid="filter-type-select"]'
  filterValue: string = '[data-testid="consumer-filters-select"]'
  filterApplyBtn: string = '[data-testid="btn-filter-apply"]'
  allConsumerTable: string = '[data-testid="all-consumer-control-tbl"]'
  editProductBtn: string = '[data-testid="2-edit-btn"]'
  ipRestrictionOption: string = '[data-testid="ip-restrictions-card"]'
  rateLimitingOption: string = '[data-testid="ratelimit-card"]'
  consumerDialogSaveBtn: string = '[data-testid="edit-consumer-dialog-edit-save-btn"]'
  requesterProfileName: string = '[data-testid="user-profile-name"]'
  requestDetailsTbl: string = '[data-testid="ar-request-details"]'
  labelsGroupSelection: string = '[data-testid="labels-group-select"]'
  labelsGroupValueInput: string = '[data-testid="labels-values-0-input"]'
  labelName: string = '[name="newLabelGroup"]'
  clearAllFilterBtn: string = '[data-testid="btn-filter-clear-all"]'
  labelValueInput: string = '[data-testid="consumer-filters-label-input"]'
  manageLabelsBtn: string = '[data-testid="manage-labels-btn"]'
  manageLabelsSaveBtn: string = '[data-testid="groups-labels-save-btn"]'
  grantAccessProduct: string = '[data-testid="ar-product-select"]'
  grantAccessEnvironment: string = '[data-testid="ar-environment-select"]'
  grantAccessBtn: string = '[data-testid="ar-grant-btn"]'
  consumerGrantAccessBtn: string = '[data-testid="consumer-grant-btn"]'
  rateLimitingApplyBtn: string = '[data-testid="ratelimit-submit-btn"]'
  removeRateLimitControlButton: string = '[data-testid="ratelimit-item-delete-btn-0"]'
  rateLimitRouteRadioBtn: string = '[data-testid="ratelimit-route-radio"]'

  clickOnRateLimitingOption() {
    cy.get(this.rateLimitingOption, { timeout: 2000 }).click()
    this.deleteRateLimitControl()
  }

  clickOnIPRestrictionOption() {
    cy.get(this.ipRestrictionOption, { timeout: 2000 }).click()
    this.deleteIPRestrictionControl()
  }


  clickOnTheFirstConsumerID() {
    cy.get(this.allConsumerTable).find('a').last().click()
    // cy.contains('Add Controls').should('be.visible')
  }

  setRateLimiting(requestCount: string, scope = 'Service', policy = 'Local') {
    this.editConsumerDialog()
    cy.wait(1000)
    this.clickOnRateLimitingOption()
    cy.wait(1000)
    cy.get(this.rateLimitHourInput, { timeout: 2000 }).click()
    cy.get(this.rateLimitHourInput, { timeout: 2000 }).type(requestCount)
    if (scope.toLocaleLowerCase() !== 'service') {
      cy.get(this.rateLimitRouteRadioBtn).click()
    }
    if (policy.toLocaleLowerCase() !== 'local') {
      cy.get(this.policyDropDown).select(policy, { force: true }).invoke('val')
    }
    cy.get(this.rateLimitingApplyBtn).click()
    cy.wait(500)
    cy.get(this.consumerDialogSaveBtn).click()
    cy.wait(1000)

  }

  setAllowedIPAddress(allowIP: string, scope = 'Service') {
    this.editConsumerDialog()
    cy.wait(1000)
    this.clickOnIPRestrictionOption()
    cy.get(this.ipRestrictionAllowInput, { timeout: 2000 }).type(allowIP + '{enter}')
    if (scope === 'Route') {
      cy.contains('span', 'Route').click({ force: true })
    }
    cy.get(this.applyBtn).click()
    // cy.contains('h2', 'ip-restriction').should('be.visible')
    cy.wait(500)
    cy.get(this.consumerDialogSaveBtn).click()
    cy.wait(1000)

  }

  verifyVisibilityOfTheRateLimiting() {
    cy.contains('h4', 'rate-limiting').should('be.visible')
  }

  deleteIPRestrictionControl() {
    // cy.wait(2000)
    cy.get("body").then($body => {
      if ($body.find(this.removeIPRestrictionButton).length > 0) {
        cy.get(this.removeIPRestrictionButton, { timeout: 2000 }).click()
      }
    });
   
  }
  
  deleteRateLimitControl() {
    cy.get("body").then($body => {
      if ($body.find(this.removeRateLimitControlButton).length > 0) {
        cy.get(this.removeRateLimitControlButton, { timeout: 2000 }).click()
      }
    });
  }
  clearIPRestrictionControl() {
    this.editConsumerDialog()
    cy.wait(1000)
    this.clickOnIPRestrictionOption()
    cy.get(this.consumerDialogSaveBtn).click()
    cy.wait(1000)
  }

  clearRateLimitControl() {
    this.editConsumerDialog()
    cy.wait(1000)
    this.clickOnRateLimitingOption()
    cy.get(this.consumerDialogSaveBtn).click()
    cy.wait(1000)
  }

  approvePendingRequest() {
    cy.get(this.approveBtn).click({ force: true })
  }

  reviewThePendingRequest() {
    cy.wait(3000)
    cy.get(this.reviewBtn).click({ force: true })
  }

  isApproveAccessEnabled(expStatus: boolean) {
    if (expStatus)
      cy.contains('Review').should('be.visible')
    else
      cy.contains('Review').should('not.exist')
  }

  filterConsumerByTypeAndValue(type: string, value: string, labelValue?: string) {
    labelValue = labelValue || ""
    cy.get("body").then($body => {
      if ($body.find(this.clearAllFilterBtn).length > 0) {
        cy.get(this.clearAllFilterBtn, { timeout: 2000 }).click()
      }
    });
    cy.get(this.filterType).select(type).invoke('val')
    cy.get(this.filterValue).select(value).invoke('val')
    debugger
    if (type == 'Labels') {
      cy.get(this.labelValueInput).type(labelValue)
    }
    cy.get(this.filterApplyBtn).click()
  }

  editConsumerDialog() {
    cy.get(this.editProductBtn).then($button => {
      if ($button.is(':visible')) {
        cy.get(this.editProductBtn).contains("Edit").click()
      }
    })
  }

  verifyRequestDetails(productDetails: any, accessRequestDetails: any, applicationDetails: any) {
    let fieldName
    cy.get(this.requesterProfileName).then(($el) => {
      expect($el.text().trim()).to.eq('Harley Jones')
    })
    cy.get(this.requestDetailsTbl).find('dt').each(($e1, index, $list) => {
      if ($e1.text() === 'Environment') {
        expect($e1.next().text().trim()).to.eq('Dev')
      }
      if ($e1.text() === 'Application') {
        debugger
        expect($e1.next().text().trim()).to.eq(applicationDetails.name)
      }
      if ($e1.text() === 'Instructions from the API Provider') {
        expect($e1.next().text().trim()).to.eq(productDetails.environment.config.optionalInstructions)
      }
      if ($e1.text() === 'Requester Comments') {
        expect($e1.next().text().trim()).to.eq(accessRequestDetails.notes)
      }
    })
  }

  addGroupLabels(groupLabels: any) {
    Object.entries(groupLabels.labels).forEach((entry, index) => {
      debugger
      cy.get(this.labelsGroupSelection).select('[+] Add New Label Group...').invoke('val')
      cy.get(this.labelName).type(entry[0])
      cy.contains('Add').click()
      cy.get('[data-testid="labels-values-' + index + '-input"]').type(entry[1])
      cy.contains('Add more labels').click()
    })
    cy.wait(1000)
  }

  verifyFilterResults(filterType: string, filterValue: string, expectedResult: string, labelValue?: any) {
    cy.wait(2000)
    this.filterConsumerByTypeAndValue(filterType, filterValue, labelValue)
    cy.wait(2000)
    cy.get(this.allConsumerTable).find("tbody").find("tr").then((row) => {
      expect(row.length.toString()).eq(expectedResult)
    })
  }

  openManageLabelsWindow() {
    cy.wait(1000)
    cy.get(this.manageLabelsBtn).then($el => {
      cy.wrap($el).click()
    })
  }

  deleteManageLabels() {
    var labelType: any
    let labelValue: any
    this.openManageLabelsWindow()
    cy.get('[data-testid="labels-groups-0"]').invoke('val').then(($type) => {
      cy.get('[data-testid="labels-values-0"]').find('span').first().then(($value) => {
        labelValue = $value.text()
        labelType = $type
        cy.get('[data-testid="labels-values-0"]').find('button').first().then(($button) => {
          cy.wrap($button).focus()
          cy.wrap($button).click()
          cy.get(this.manageLabelsSaveBtn).click({ force: true })
          cy.get(this.manageLabelsBtn, { timeout: 10000 }).should('be.visible');
          cy.contains(labelType + ' = ' + labelValue).should('not.exist')
        })
      })
    })
  }

  updateManageLabels() {
    var labelType: any
    let labelValue: any
    this.openManageLabelsWindow()
    cy.get('[data-testid="labels-groups-0"]').invoke('val').then(($type) => {
      cy.get('[data-testid="labels-values-0"]').find('span').first().then(($value) => {
        cy.get('[data-testid="labels-values-0"]').find('button').first().then(($button) => {
          cy.wrap($button).focus()
          cy.wrap($button).click()
          labelValue = $value.text()
          labelType = $type
          labelValue = labelValue + '123'
          cy.get('[data-testid="labels-values-0"]').type(labelValue)
          cy.get(this.manageLabelsSaveBtn).click({ force: true })
          cy.get(this.manageLabelsBtn, { timeout: 10000 }).should('be.visible');
          cy.contains(labelType + ' = ' + labelValue).should('exist')
        })
      })
    })
  }

  addManageLabels() {
    cy.wait(2000)
    debugger
    cy.get(this.manageLabelsBtn).parents('ul').find('li').then(($ele) => {
      debugger
      const index = $ele.length - 1
      this.openManageLabelsWindow()
      cy.get(this.labelsGroupSelection).select('[+] Add New Label Group...').invoke('val')
      cy.get(this.labelName).type("Entity")
      cy.contains('Add').click()
      cy.get('[data-testid="labels-values-' + index + '-input"]').type("Drug Store")
      cy.get(this.manageLabelsSaveBtn).click({ force: true })
      cy.get(this.manageLabelsBtn, { timeout: 10000 }).should('be.visible');
      cy.contains('Entity = Drug Store').should('exist')
    })
  }

  clickOnGrantAccessBtn() {
    cy.get(this.consumerGrantAccessBtn).click()
  }

  grantAccessToGivenProductEnvironment(product: string, environment: string) {
    cy.get(this.grantAccessProduct).select(product).invoke('val')
    cy.get(this.grantAccessEnvironment).select(environment).invoke('val')
    cy.get(this.grantAccessBtn).click()
    cy.wait(1000)
  }
}
