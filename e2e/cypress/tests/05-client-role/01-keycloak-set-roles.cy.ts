import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import AuthorizationProfile from '../../pageObjects/authProfile'
import ConsumersPage from '../../pageObjects/consumers'
import HomePage from '../../pageObjects/home'
import keycloakClientsPage from '../../pageObjects/keycloakClients'
import keycloakGroupPage from '../../pageObjects/keycloakGroup'
import KeycloakUserGroupPage from '../../pageObjects/keycloakUserGroup'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'
import Products from '../../pageObjects/products'

describe('Apply Shared IDP config at Keycloak user group', () => {
  const clients = new keycloakClientsPage()
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
  })

  it('Authenticates Admin owner', () => {
    cy.get('@admin').then(({ user }: any) => {
      cy.contains('Administration Console').click({force:true})
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

