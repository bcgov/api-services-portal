import keycloakUsersPage from '../../pageObjects/keycloakUsers'

describe('Give a user org admin access at organization level', () => {
  const user = new keycloakUsersPage()

  before(() => {
    cy.visit(Cypress.env('KEYCLOAK_URL'))
    cy.deleteAllCookies()
    cy.reload(true)
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
      cy.contains('Administration Console').click({force:true})
      cy.keycloakLogin(user.credentials.username, user.credentials.password)
    })
  })

  it('Navigate to Users Page', () => {
    cy.contains('Users').click()
  })

  it('Search Wendy (Credential Issuer) from the user list', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      user.editUser(clientCredentials.Wendy.email)
    })
  })

  it('Navigate to Groups tab', () => {
    user.selectTab('Groups')
  })

  it('Set the user to the Organization Unit', () => {
    user.setUserToOrganization('ministry-of-health')
  })

  after(() => {
    cy.keycloakLogout()
  })
})