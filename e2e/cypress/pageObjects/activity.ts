class ActivityPage {
  path: string = '/manager/activity'
  userProfile: string = '[data-testid=my_profile_json]'
  clearAllBtn: string = '[data-testid="btn-filter-clear-all"]'

  checkActivityFilterForUser(user: string, response: any): void {
    let responseText: any
    let activityText: string
    this.setFilterCondition("User",user)
    var filteredResponse: any
    var activityCount: any
    const para = document.querySelector('p');
    debugger
    filteredResponse = Cypress._.filter(response, ["params.actor", user])
    // expect(cy.get('[data-testid^="activity-feed-heading-"]').nextAll('div').should('have.length', filteredResponse.length))
    // filteredResponse.forEach(function (accessResponse: any) {
    //   responseText = accessResponse.params.actor + " " + accessResponse.params.action
      cy.get('[data-testid^="activity-feed-heading-"]').nextAll('div').each(($e1, index, $list) => {
        cy.wrap($e1).find('mark').invoke('text').then((actor) => {
          cy.wrap($e1).find('strong').invoke('text').then((action) => {
            debugger
            activityText = actor + " " + action
            responseText = filteredResponse[index].message
            // responseText = responseText.replaceAll("{","`${filteredResponse[index].params.")
            // responseText = responseText.replaceAll("}","}`")
            responseText = responseText.replaceAll("{","${filteredResponse[index].params.")
            // responseText = responseText.replaceAll("}","}`")
            // responseText = `${responseText}`
            const regexp = /\${([^{]+)}/g;
            let result = responseText.replace(regexp, function(ignore:any, key:any){
              return eval(key);
          });
            cy.log("Result -> "+result)  
            responseText = "`"+responseText +"`"
            responseText = `${filteredResponse[index].params.actor}-${filteredResponse[index].params.action}`
            responseText = filteredResponse[index].params.actor + " " + filteredResponse[index].params.action
            assert.equal(activityText,responseText)
          })
        })
      })
    // })
  }

  setFilterCondition(filterBy: string, filterValue: string)
  {
    cy.get("body").then($body => {
      if ($body.find(this.clearAllBtn).length > 0) {
        cy.get(this.clearAllBtn, { timeout: 2000 }).click()
      }
    })
    cy.get('[data-testid="filter-type-select"]').select(filterBy, { force: true }).invoke('val')
    cy.get('[data-testid="activity-filters-users-input"]', { timeout: 2000 }).type(filterValue + '{enter}')
    cy.wait(3000)
  }
}
export default ActivityPage