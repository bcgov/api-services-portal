class ActivityPage {
  path: string = '/manager/activity'
  userProfile: string = '[data-testid=my_profile_json]'
  clearAllBtn: string = '[data-testid="btn-filter-clear-all"]'
  loadButton: string = '[data-testid="activity-feed-load-more-btn"]'

  checkActivityFilter(filterCondition: string, value: string, response: any): void {
    let responseText: any
    let activityText: string
    var flag = false
    this.setFilterCondition(filterCondition, value)
    var filteredResponse: any
    let result: any
    if (value == "") {
      filteredResponse = response
    }
    else if (filterCondition.toLowerCase() === 'user') {
      filteredResponse = Cypress._.filter(response, ["params.actor", value])
    }
    else {
      filteredResponse = Cypress._.filter(response, ["params." + filterCondition.toLowerCase(), value])
    }
    cy.get('[data-testid^="activity-feed-heading-"]').nextAll('div').then($elements => {
      assert.equal($elements.length, filteredResponse.length)
    })
    cy.get('[data-testid^="activity-feed-heading-"]').nextAll('div').each(($e1, index, $list) => {
      cy.wrap($e1).find('p').invoke('text').then((text) => {
        activityText = text
        filteredResponse.forEach((record: any) => {
          responseText = record.message
          responseText = responseText.replaceAll("{", "${filteredResponse[index].params.")
          const regexp = /\${([^{]+)}/g;
          if (!(record.result === 'failed')) {
              result = responseText.replace(regexp, function (ignore: any, key: any) {
              return eval(key);
            });
          }
          else if(responseText.includes("Failed to Apply Workflow - IssuerMisconfigError"))
          {
            result = 'Failed to Apply Workflow - IssuerMisconfigError: undefined'
          }
          if (result === activityText) {
            flag = true
          }
        });
        assert.isTrue(flag, "Record mismatch for " + activityText)
      })
    })
  }

  setFilterCondition(filterBy: string, filterValue: string) {
    cy.get("body").then($body => {
      if ($body.find(this.clearAllBtn).length > 0) {
        cy.get(this.clearAllBtn, { timeout: 2000 }).click()
      }
    })
    cy.get('[data-testid="filter-type-select"]').select(filterBy, { force: true }).invoke('val')
    cy.get('[data-testid="activity-filters-' + filterBy.toLowerCase() + 's-input"]', { timeout: 2000 }).type(filterValue + '{enter}')
    cy.wait(3000)
    this.loadMoreRecords()
  }

  loadMoreRecords() {
    cy.get("body").then($body => {
      if ($body.find(this.loadButton).length > 0) {
        cy.get(this.loadButton).click({ force: true })
        cy.wait(2000)
      }
    })
  }
}
export default ActivityPage