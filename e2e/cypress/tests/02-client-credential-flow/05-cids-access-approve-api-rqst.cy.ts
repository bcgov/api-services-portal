import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import ConsumersPage from '../../pageObjects/consumers'
import KeycloakUserGroupPage from '../../pageObjects/keycloakUserGroup'
import keycloakGroupPage from '../../pageObjects/keycloakGroup'
import AuthorizationProfile from '../../pageObjects/authProfile'
import keycloakClientScopesPage from '../../pageObjects/keycloakClientScopes'

describe('Access manager approves developer access request for Client ID/Secret authenticator', () => {
  const home = new HomePage()
  const login = new LoginPage()
  const consumers = new ConsumersPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('apiowner').as('apiowner')
    // cy.visit(login.path)
  })

  it('Access Manager logs in', () => {
    cy.get('@access-manager').then(({ user }: any) => {
      cy.get('@apiowner').then(({ clientCredentials }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        home.useNamespace(clientCredentials.namespace)
      })
    })
  })

  it('Access Manager approves developer access request', () => {
    cy.visit(consumers.path)
    consumers.reviewThePendingRequest()
  })

  it('Select scopes in Authorization Tab', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      consumers.selectAuthorizationScope(clientCredentials.clientIdSecret.authProfile.scopes)
    })
  })

  it('approves an access request', () => {
    consumers.approvePendingRequest()
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})

describe('Make an API request using Client ID, Secret, and Access Token', () => {
  it('Get access token using client ID and secret; make API request', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {

      let cc = JSON.parse(store_res.clientidsecret)

      cy.getAccessToken(cc.clientId, cc.clientSecret).then(() => {
        cy.get('@accessTokenResponse').then((token_res: any) => {
          let token = token_res.body.access_token
          cy.request({
            url: Cypress.env('KONG_URL'),
            headers: {
              Host: 'cc-service-for-platform.api.gov.bc.ca',
            },
            auth: {
              bearer: token,
            },
          }).then((res) => {
            expect(res.status).to.eq(200)
          })
        })
      })
    })
  })
})

describe('Verify the selected client scoped is displayed in assigned default list', () => {
  const clientScopes = new keycloakClientScopesPage()
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
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})

describe('Deselect the scope from authorization tab', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const consumers = new ConsumersPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('manage-control-config-setting').as('manage-control-config-setting')
    // cy.visit(login.path)
  })

  it('authenticates Mark (Access Manager)', () => {
    cy.get('@access-manager').then(({ user }: any) => {
      cy.get('@apiowner').then(({ clientCredentials }: any) => {
        cy.login(user.credentials.username, user.credentials.password).then(() => {
          home.useNamespace(clientCredentials.namespace);
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
})

describe('Verify the selected client scoped is not displayed in assigned default list', () => {
  const clientScopes = new keycloakClientScopesPage()
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

  it('Verify that "System.Write" scope is not in assigned default scope', () => {
    clientScopes.verifyAssignedScope('System.Write', false)
  })

  after(() => {
    cy.keycloakLogout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})

// describe('Revoke product environment access for Client Credential authorization spec', () => {
//   const login = new LoginPage()
//   const consumers = new ConsumersPage()
//   const home = new HomePage()

//   before(() => {
//     cy.visit('/')
//     cy.deleteAllCookies()
//     cy.reload()
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
//         home.useNamespace(clientCredentials.namespace);
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