import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import ConsumersPage from '../../pageObjects/consumers'
import KeycloakUserGroupPage from '../../pageObjects/keycloakUserGroup'
import keycloakGroupPage from '../../pageObjects/keycloakGroup'
import AuthorizationProfile from '../../pageObjects/authProfile'
import keycloakClientScopesPage from '../../pageObjects/keycloakClientScopes'

describe('Deselect the scope from authorization tab', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const consumers = new ConsumersPage()

  before(() => {
    cy.visit('/')
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('manage-control-config-setting').as('manage-control-config-setting')
    cy.fixture('common-testdata').as('common-testdata')
    // cy.visit(login.path)
  })

  it('authenticates Mark (Access Manager)', () => {
    cy.get('@access-manager').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ clientCredentials }: any) => {
        cy.login(user.credentials.username, user.credentials.password).then(() => {
          cy.activateGateway(clientCredentials.namespace);
        })
      })
    })
  })

  it('Navigate to Consumer page ', () => {
    cy.visit(consumers.path);
  })

  it('Select the consumer from the list ', () => {
    consumers.clickOnTheFirstConsumerID()
  })

  it('Deselect scopes in Authorization Tab', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      consumers.editConsumerDialog()
      consumers.selectAuthorizationScope(clientCredentials.clientIdSecret.authProfile.scopes, false)
      consumers.saveAppliedConfig()
    })
  })
  after(() => {
    cy.logout()
  })
})