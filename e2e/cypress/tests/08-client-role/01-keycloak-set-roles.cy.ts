import keycloakClientsPage from '../../pageObjects/keycloakClients'

describe('Set roles in Keycloak auth client', () => {
  const clients = new keycloakClientsPage()

  before(() => {
    cy.visit(Cypress.env('KEYCLOAK_URL'))
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/regen').as('regen')
    cy.fixture('admin').as('admin')
    cy.fixture('common-testdata').as('common-testdata')
  })

  it('Authenticates Admin owner', () => {
    cy.get('@admin').then(({ user }: any) => {
      cy.keycloakLogin(user.credentials.username, user.credentials.password)
    })
  })

  it('Add "Read" role to the client of the authorization profile', () => {
    clients.setRoles('read','cypress-auth-profile')
  })

  it('Add "Write" role to the client of the authorization profile', () => {
    clients.setRoles('write','cypress-auth-profile')
  })

  after(() => {
    cy.keycloakLogout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

