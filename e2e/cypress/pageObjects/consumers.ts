export default class ConsumersPage {
  path: string = '/manager/consumers'
  rateLimitHourInput: string = 'input#hour'
  ipRestrictionAllowInput: string ='input[id="allow"]'
  removeIPRestrictionButton : string = '[aria-label="remove control button"]'

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

  setRateLimiting(requestCount : string)
  {
    this.clickOnRateLimitingOption()
    cy.get(this.rateLimitHourInput).type(requestCount+'{enter}')
    cy.contains('button','Apply').click()
  }

  setAllowedIPAddress(allowIP : string)
  {
    this.clickOnIPRestrictionOption()
    cy.get(this.ipRestrictionAllowInput).type(allowIP)
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
    cy.get(this.removeIPRestrictionButton).click()
    cy.contains('button','Yes, Delete').click()
  }

  editAllowedIPAddress(allowIP : string)
  {
    this.editIPRestrictionSetting()
    cy.get(this.ipRestrictionAllowInput).type(allowIP)
    cy.contains('button','Apply').click()
    cy.contains('h2','ip-restriction').should('be.visible')
  }
};