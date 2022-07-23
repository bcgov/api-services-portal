import { Assertion } from "chai"
import { wrap } from "module"

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
  filterValur: string = '[data-testid="consumer-filters-select"]'
  filterApplyBtn: string = '[data-testid="btn-filter-apply"]'
  allConsumerTable: string = '[data-testid="all-consumer-control-tbl"]'
  editProductBtn: string = '[data-testid="2-edit-btn"]'
  ipRestrictionOption: string = '[data-testid="ip-restrictions-card"]'
  rateLimitingOption: string = '[data-testid="ratelimit-card"]'
  consumerDialogSaveBtn: string= '[data-testid="edit-consumer-dialog-edit-save-btn"]'

  clickOnRateLimitingOption() {
    cy.get(this.rateLimitingOption).click()
  }

  clickOnIPRestrictionOption() {
    cy.get(this.ipRestrictionOption,{ timeout: 2000 }).click()
  }


  clickOnTheFirstConsumerID() {
    cy.get(this.allConsumerTable).find('a').first().click()
    // cy.contains('Add Controls').should('be.visible')
  }

  setRateLimiting(requestCount: string, scope = 'Service', policy = 'Local') {
    this.deleteControl()
    this.clickOnRateLimitingOption()
    cy.get(this.rateLimitHourInput).type(requestCount + '{enter}')
    if (scope.toLocaleLowerCase() !== 'service') {
      cy.contains('span', 'Route').click()
    }
    if (policy.toLocaleLowerCase() !== 'local') {
      cy.get(this.policyDropDown).select(policy, { force: true }).invoke('val')
    }
    cy.get(this.applyBtn).click()
  }

  setAllowedIPAddress(allowIP: string, scope = 'Service') {
    this.editConsumerDialog()
    this.clickOnIPRestrictionOption()
    this.deleteControl()
    cy.get(this.ipRestrictionAllowInput).type(allowIP)
    if (scope === 'Route') {
      cy.contains('span', 'Route').click()
    }
    cy.get(this.applyBtn).click()
    cy.get(this.applyBtn).click()
    // cy.contains('h2', 'ip-restriction').should('be.visible')
    cy.get(this.consumerDialogSaveBtn).click()
    cy.wait(2000)
  }

  verifyVisibilityOfTheRateLimiting() {
    cy.contains('h4', 'rate-limiting').should('be.visible')
  }

  deleteControl() {
    // cy.get(this.removeIPRestrictionButton).then($button => {
    //   if ($button.is(':enabled')){
    //     cy.get(this.removeIPRestrictionButton,{ timeout: 2000 }).click()
    //     cy.wait(2000)
    //   }
    // })

    cy.get("body").then($body => {
      if ($body.find(this.removeIPRestrictionButton).length > 0) {   
        cy.get(this.removeIPRestrictionButton,{ timeout: 2000 }).click()
      }
  });
  }

  approvePendingRequest(){
    cy.wait(3000)
    cy.get(this.reviewBtn).click({ force: true })
    cy.get(this.approveBtn).click({ force: true })
  }

  isApproveAccessEnabled(expStatus : boolean) {
    if(expStatus)
      cy.contains('Review').should('be.visible')
    else
      cy.contains('Review').should('not.exist')
  }

  filterConsumerByTypeAndValue(type: string, value: string)
  {
    cy.get(this.filterType).select(type).invoke('val')
    cy.get(this.filterValur).select(value).invoke('val')
    cy.get(this.filterApplyBtn).click()
  }

  editConsumerDialog()
  {
    cy.get(this.editProductBtn).then($button => {
      if ($button.is(':visible')){
        cy.get(this.editProductBtn).contains("Edit").click()
      }
    })
  }
}