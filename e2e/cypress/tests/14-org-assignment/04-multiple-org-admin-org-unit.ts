import keycloakGroupPage from '../../pageObjects/keycloakGroup'
import keycloakUsersPage from '../../pageObjects/keycloakUsers'


describe('Give a user org admin access at organization unit level', () => {
  const user = new keycloakUsersPage()
  const groups = new keycloakGroupPage()

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

  it('Navigate to User Groups', () => {
    groups.navigateToUserGroups()
  })

  it('Add another org unit', () => {
    cy.contains('ministry-of-health').click()
    cy.get('[id="createGroup"]').click()
    cy.get('[id="name"]').type('health-protection')
    cy.contains('Save').click()
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

  it('Reset any existing assoction', () => {
    user.resetAssociation()
  })

  it('Set the user(Wendy) to the Organization Unit', () => {
    user.setUserToOrganization('health-protection')
  })

  after(() => {
    cy.keycloakLogout()
  })

})