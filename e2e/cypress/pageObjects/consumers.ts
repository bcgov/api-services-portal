export default class ConsumersPage {
  path: string = '/manager/consumers'
  rateLimitHourInput: string = 'input#hour'
  ipRestrictionAllowInput: string ='input[id="allow"]'
  removeIPRestrictionButton : string = '[aria-label="remove control button"]'
  policyDropDown : string = 'select[id="policy"]'

  clickOnTheFirstConsumerID()
  {
    cy.get('[role="table"] a').first().click()
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
    cy.contains('button','Apply').click()
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
    cy.contains('button','Apply').click()
    cy.contains('h2','ip-restriction').should('be.visible')
  }

  verifyVisibilityOfTheRateLimiting()
  {
    cy.contains('h4','rate-limiting').should('be.visible')
  }

  editIPRestrictionSetting()
  {
    cy.contains('button','Edit').click()
  }

  deleteControl()
  {
      cy.get('body', {log: false}).then(($body) => {
        if($body.find(this.removeIPRestrictionButton).length > 0) {
          cy.get(this.removeIPRestrictionButton).first().click()
          cy.contains('button','Yes, Delete').click()
      }
    })
  }

  editAllowedIPAddress(allowIP : string)
  {
    this.editIPRestrictionSetting()
    cy.get(this.ipRestrictionAllowInput).type(allowIP)
    cy.contains('button','Apply').click()
    cy.contains('h2','ip-restriction').should('be.visible')
  }
};