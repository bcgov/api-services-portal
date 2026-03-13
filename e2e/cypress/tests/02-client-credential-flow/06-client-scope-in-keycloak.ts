import keycloakClientScopesPage from '../../pageObjects/keycloakClientScopes'

describe('Verify the selected client scoped is displayed in assigned default list', () => {
  const clientScopes = new keycloakClientScopesPage()

  before(() => {
    cy.visit(Cypress.env('KEYCLOAK_URL'))
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/regen').as('regen')
    cy.fixture('admin').as('admin')
  })

  it('Authenticates Admin owner', () => {
    cy.get('@admin').then(({ user }: any) => {
      cy.keycloakLogin(user.credentials.username, user.credentials.password)
    })
  })

  it('Navigate to Clients page', () => {
    cy.get('[id=nav-toggle').click()
    cy.contains('Clients').click()
  })

  it('Select the consumer ID', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {
      let cc = JSON.parse(store_res.clientidsecret)
      cy.contains(cc.clientId).click({ force: true })
    })
  })

  it('Navigate to client scope tab', () => {
    clientScopes.selectTab('Client scopes')
  })

  it('Verify that "System.Write" scope is in assigned default scope', () => {
    clientScopes.verifyAssignedScope('System.Write', true)
  })

  after(() => {
    cy.keycloakLogout()
  })

})