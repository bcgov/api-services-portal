export default class ConsumersPage {
  path: string = '/manager/consumers'
  rateLimitHourInput: string = '[data-testid="ratelimit-hour-input"]'
  ipRestrictionAllowInput: string ='[data-testid="allow-ip-restriction-input"]'
  removeIPRestrictionButton : string = '[data-testid="remove-control-btn"]'
  policyDropDown : string = '[data-testid="ratelimit-policy-dropdown"]'
  applyBtn : string = '[data-testid="control-dialog-apply-btn"]'
  allConsumerTable : string = '[data-testid="all-consumer-control-tbl"]'

  clickOnTheFirstConsumerID()
  {
    cy.get(this.allConsumerTable).find('a').first().click()
    cy.contains('Add Controls').should('be.visible')
  }
  clickOnRateLimitingOption()
  {
    cy.contains('p','Rate Limiting').click()
  }

  clickOnIPRestrictionOption()
  {
    cy.contains('p','IP Restrictions').click()
  }

  setRateLimiting(requestCount : string, scope ='Service', policy ='Local')
  {
    this.deleteControl()
    this.clickOnRateLimitingOption()
    cy.get(this.rateLimitHourInput).type(requestCount+'{enter}')
    if (scope.toLocaleLowerCase()!=='service')
    {
      cy.contains('span','Route').click()
    }
    if (policy.toLocaleLowerCase()!=='local')
    {
      cy.get(this.policyDropDown).select(policy,{ force: true }).invoke('val')
    }
    cy.get(this.applyBtn).click()
  }

  setAllowedIPAddress(allowIP : string, scope ='Service')
  {
    this.deleteControl()
    this.clickOnIPRestrictionOption()
    cy.get(this.ipRestrictionAllowInput).type(allowIP)
    if (scope==='Route')
    {
      cy.contains('span','Route').click()
    }
    cy.get(this.applyBtn).click()
    cy.contains('h2','ip-restriction').should('be.visible')
  }

  verifyVisibilityOfTheRateLimiting()
  {
    cy.contains('h4','rate-limiting').should('be.visible')
  }

  // editIPRestrictionSetting()
  // {
  //   cy.contains('button','Edit').click()
  // }

  deleteControl()
  {
      cy.get('body', {log: false}).then(($body) => {
        if($body.find(this.removeIPRestrictionButton).length > 0) {
          cy.get(this.removeIPRestrictionButton).first().click()
          cy.contains('button','Yes, Delete').click()
      }
    })
  }

  // editAllowedIPAddress(allowIP : string)
  // {
  //   this.editIPRestrictionSetting()
  //   cy.get(this.ipRestrictionAllowInput).type(allowIP)
  //   cy.contains('button','Apply').click()
  //   cy.contains('h2','ip-restriction').should('be.visible')
  // }
};