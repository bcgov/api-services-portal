import AuthorizationProfile from '../../pageObjects/authProfile'
import HomePage from '../../pageObjects/home'
import keycloakGroupPage from '../../pageObjects/keycloakGroup'
import KeycloakUserGroupPage from '../../pageObjects/keycloakUserGroup'

describe('Apply Shared IDP config at Keycloak user group', () => {
  const userGroups = new KeycloakUserGroupPage()
  const groups = new keycloakGroupPage()

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

  it('Navigate to User Groups', () => {
    cy.get('[id=nav-toggle').click()
    cy.contains('Groups').click()
  })

  it('Select the namespace', () => {
    cy.get('@common-testdata').then(({ apiTest }: any) => {
      cy.get('a').filter((_, el) => el.textContent.trim() === 'ns').click({ force: true })
      cy.contains(apiTest.namespace).click()
    })
  })

  it('Navigate to attribute tab', () => {
    cy.get(userGroups.attributeTab).click({force:true})
  })

  it('Set the Attributes', () => {
    groups.setAttribute('perm-protected-ns','allow')
  })

  after(() => {
    cy.keycloakLogout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})

