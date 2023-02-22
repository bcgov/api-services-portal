import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import AuthorizationProfile from '../../pageObjects/authProfile'
import ConsumersPage from '../../pageObjects/consumers'
import HomePage from '../../pageObjects/home'
import keycloakGroupPage from '../../pageObjects/keycloakGroup'
import KeycloakUserGroupPage from '../../pageObjects/keycloakUserGroup'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'
import Products from '../../pageObjects/products'

describe('Apply Shared IDP config at Keycloak user group', () => {
  const userGroups = new KeycloakUserGroupPage()
  const groups = new keycloakGroupPage()
  var nameSpace: string
  const home = new HomePage()
  const authProfile = new AuthorizationProfile()

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

  it('Navigate to User Groups', () => {
    cy.contains('Groups').click()
  })

  it('Edit the namespace from the tree view', () => {
    cy.get('@admin').then(({ namespace }: any) => {
      cy.contains(namespace).click()
      userGroups.clickOnEditButton()
    })
  })

  it('Navigate to attribute tab', () => {
    userGroups.selectTab('Attributes')
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

