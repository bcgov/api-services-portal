import { Assertion } from "chai"

class keycloakClientScopesPage {
  path: string = '/'

  clientTabs: string = '[data-testid="client-tabs"]'
  tableSearchInput: string = '[data-testid="table-search-input"]'

  selectTab(tabName: string){
    cy.get(this.clientTabs).contains('a',tabName).click({ force: true })
  }

  verifyAssignedScope(scope: string, expResult:boolean)
  {
    cy.get(this.tableSearchInput).clear().type(scope).type('{enter}');
    if(expResult){
      cy.get('.pf-v5-c-table__tbody > .pf-v5-c-table__tr > :nth-child(2)').contains(scope).should('exist');
    }
    else{
      cy.get('[data-testid="empty-state"]').should('exist');
    }
  }
}

export default keycloakClientScopesPage
