import HomePage from '../../pageObjects/home'
import AuthorizationProfile from '../../pageObjects/authProfile'
import keycloakClientScopesPage from '../../pageObjects/keycloakClientScopes'

describe('Verify the selected client scoped is not displayed in assigned default list', () => {
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

  it('Verify that "System.Write" scope is not in assigned default scope', () => {
    clientScopes.verifyAssignedScope('System.Write', false)
  })

  after(() => {
    cy.keycloakLogout()
  })

})

// describe('Revoke product environment access for Client Credential authorization spec', () => {
//   const login = new LoginPage()
//   const consumers = new ConsumersPage()
//   const home = new HomePage()

//   before(() => {
//     cy.visit('/')
//     cy.deleteAllCookies()
//     cy.reload(true)
//   })

//   beforeEach(() => {
//     cy.preserveCookies()
//     cy.fixture('access-manager').as('access-manager')
//     cy.fixture('apiowner').as('apiowner')
//     cy.fixture('developer').as('developer')
//     cy.fixture('state/store').as('store')
//   })

//   it('authenticates Mark (Access-Manager)', () => {
//     cy.get('@apiowner').then(({ clientCredentials }: any) => {
//       cy.get('@access-manager').then(({ user }: any) => {
//         cy.login(user.credentials.username, user.credentials.password)
//         cy.activateGateway(clientCredentials.namespace);
//       })
//     })
//   })

//   it('Navigate to Consumer page and filter the product', () => {
//     cy.get('@apiowner').then(({ clientCredentials }: any) => {
//       cy.visit(consumers.path);
//       let product = clientCredentials.clientIdSecret.product
//       consumers.filterConsumerByTypeAndValue('Products', product.name)
//     })
//   })

//   it('Click on the first consumer', () => {
//     consumers.clickOnTheFirstConsumerID()
//   })

//   it('Revoke access for Test environment', () => {
//     cy.wait(1000)
//     consumers.revokeProductEnvAccess('Test')
//   })

//   it('Verify the confirmation message once the access is revoked', () => {
//     cy.verifyToastMessage("Product Revoked")
//   })
  

//   after(() => {
//     cy.logout()
//     cy.clearLocalStorage({ log: true })
//     cy.deleteAllCookies()
//   })

// })