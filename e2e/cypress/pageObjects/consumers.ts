import { Assertion } from "chai"
import { wrap } from "module"

export default class ConsumersPage {
  path: string = '/manager/consumers'
  rateLimitHourInput: string = '[data-testid="ratelimit-hour-input"]'
  ipRestrictionAllowInput: string = '[data-testid="allow-ip-restriction-input"]'
  removeIPRestrictionButton: string = '[data-testid="remove-control-btn"]'
  policyDropDown: string = '[data-testid="ratelimit-policy-dropdown"]'
  applyBtn: string = '[data-testid="control-dialog-apply-btn"]'
  allConsumerTable: string = '[data-testid="all-consumer-control-tbl"]'
  aclSwitch: string = '[data-testid="acls-switch"]'
  pendingRequestTable: string = '[data-testid="pending-request-tbl"]'

  clickOnTheFirstConsumerID() {
    cy.get(this.allConsumerTable).find('a').first().click()
    cy.contains('Add Controls').should('be.visible')
  }
  clickOnRateLimitingOption() {
    cy.contains('p', 'Rate Limiting').click()
  }

  clickOnIPRestrictionOption() {
    cy.contains('p', 'IP Restrictions').click()
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
    this.deleteControl()
    this.clickOnIPRestrictionOption()
    cy.get(this.ipRestrictionAllowInput).type(allowIP)
    if (scope === 'Route') {
      cy.contains('span', 'Route').click()
    }
    cy.get(this.applyBtn).click()
    cy.contains('h2', 'ip-restriction').should('be.visible')
  }

  verifyVisibilityOfTheRateLimiting() {
    cy.contains('h4', 'rate-limiting').should('be.visible')
  }

  turnOnACLSwitch(flag: Boolean) {
    debugger
    cy.get(this.aclSwitch).find('input').then(($btn) => {
      if ($btn.is(':checked') != flag) {
        cy.wrap($btn).invoke('show')
        cy.wrap($btn).click({ force: true })
        cy.wait(3000)
      }
    })
  }

  deleteControl() {
    cy.get('body', { log: false }).then(($body) => {
      if ($body.find(this.removeIPRestrictionButton).length > 0) {
        cy.get(this.removeIPRestrictionButton).first().click()
        cy.contains('button', 'Yes, Delete').click()
      }
    })
  }

  isApproveAccessEnabled(expStatus : boolean) {
    var actStatus = false
    cy.get('body', { log: false }).then(($body) => {
      cy.wait(1000)
      if ($body.find(this.pendingRequestTable).length > 0)
        actStatus = true
      else
        actStatus = false
      assert.strictEqual (actStatus,expStatus,"Approve Request option staus is other than expected status")
    })
  }
}