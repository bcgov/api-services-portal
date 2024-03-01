import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import ConsumersPage from '../../pageObjects/consumers'
import KeycloakUserGroupPage from '../../pageObjects/keycloakUserGroup'
import keycloakGroupPage from '../../pageObjects/keycloakGroup'
import AuthorizationProfile from '../../pageObjects/authProfile'
import keycloakClientScopesPage from '../../pageObjects/keycloakClientScopes'

describe('Verify the selected client scoped is displayed in assigned default list', () => {
  const clientScopes = new keycloakClientScopesPage()
  const groups = new keycloakGroupPage()
  var nameSpace: string
  const home = new HomePage()
  const authProfile = new AuthorizationProfile()

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
      cy.contains('Administration Console').click({ force: true })
      cy.keycloakLogin(user.credentials.username, user.credentials.password)
    })
  })

  it('Navigate to Clients page', () => {
    cy.contains('Clients').click()
  })

  it('Select the consumer ID', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {
      let cc = JSON.parse(store_res.clientidsecret)
      cy.contains(cc.clientId).click()
    })
  })

  it('Navigate to client scope tab', () => {
    clientScopes.selectTab('Client Scopes')
  })

  it('Verify that "System.Write" scope is in assigned default scope', () => {
    clientScopes.verifyAssignedScope('System.Write', true)
  })

  after(() => {
    cy.keycloakLogout()
  })

})