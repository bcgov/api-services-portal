import { Assertion } from "chai"

class keycloakClientScopesPage {
  path: string = '/'

  clientTab: string = '[data-ng-controller="ClientTabCtrl"]'

  selectTab(tabName: string){
    cy.get(this.clientTab).contains('a',tabName).click()
  }

  verifyAssignedScope(scope: string, expResult:boolean)
  {
    if(expResult){
      cy.get('[id="assigned"]').find('[title="'+scope+'"]').should('exist');
    }
    else{
      cy.get('[id="assigned"]').find('[title="'+scope+'"]').should('not.exist');
    }
  }
}

export default keycloakClientScopesPage
