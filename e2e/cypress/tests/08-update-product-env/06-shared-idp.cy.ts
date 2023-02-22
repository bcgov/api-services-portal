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

describe('Apply Shared IDP while creating Authorization Profile', () => {
  const login = new LoginPage()
  var nameSpace: string
  const home = new HomePage()
  const authProfile = new AuthorizationProfile()
  let userSession: string

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
    cy.clearAllCookies()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('api').as('api')
    cy.fixture('state/regen').as('regen')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.getUserSession().then(() => {
      cy.get('@apiowner').then(({ user, namespace }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        home.useNamespace(namespace)
        cy.get('@login').then(function (xhr: any) {
          userSession = xhr.response.headers['x-auth-request-access-token']
        })
      })
    })
  })

  it('Prepare the Request Specification for the API', () => {
    cy.get('@api').then(({ authorizationProfiles }: any) => {
      cy.setHeaders(authorizationProfiles.headers)
      cy.setAuthorizationToken(userSession)
      cy.setRequestBody(authorizationProfiles.shared_IDP_body)
    })
  })

  it('Publish the Shared IDP profile', () => {
    cy.get('@apiowner').then(({ namespace }: any) => {
      cy.makeAPIRequest('ds/api/v2/namespaces/' + namespace + '/issuers', 'PUT').then((response) => {
        expect(response.status).to.be.equal(200)
        expect(response.body.result).to.be.contain('created')
        cy.wait(5000)
      })
    })
  })

  it('Create an authorization profile and associate it with shared IPD', () => {
    cy.visit(authProfile.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let ap = clientCredentials.sharedIDP.authProfile
      authProfile.createAuthProfile(ap)
      cy.get(authProfile.profileTable).contains(ap.name).should('be.visible')
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
    cy.clearCookies()
  })

})

describe('Update IDP issuer for shared IDP profile', () => {

  const login = new LoginPage()
  const home = new HomePage()
  let userSession: string
  const authProfile = new AuthorizationProfile()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('api').as('api')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.getUserSession().then(() => {
      cy.get('@apiowner').then(({ user, namespace }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        home.useNamespace(namespace)
        cy.get('@login').then(function (xhr: any) {
          userSession = xhr.response.headers['x-auth-request-access-token']
        })
      })
    })
  })

  it('Prepare the Request Specification for the API', () => {
    cy.get('@api').then(({ authorizationProfiles }: any) => {
      cy.setHeaders(authorizationProfiles.headers)
      cy.setAuthorizationToken(userSession)
      cy.setRequestBody(authorizationProfiles.shared_IDP_update_body)
    })
  })

  it('Put the resource and verify the success code in the response', () => {
    cy.get('@apiowner').then(({ namespace }: any) => {
      cy.makeAPIRequest('ds/api/v2/namespaces/' + namespace + '/issuers', 'PUT').then((response) => {
        expect(response.status).to.be.equal(200)
      })
    })
  })

  it('Edit the created profile and verify the updated Issuer URL', () => {
    cy.visit(authProfile.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let ap = clientCredentials.sharedIDP.authProfile
      authProfile.editAuthorizationProfile(ap.name)
      cy.wait(2000)
      cy.get('@api').then(({ authorizationProfiles }: any) => {
        authProfile.verifyAuthorizationProfileIssuerURL(authorizationProfiles.shared_IDP_update_body.environmentDetails[0].issuerUrl)
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
    cy.clearCookies()
  })

})

describe('Update IDP issuer for shared IDP profile', () => {

  const login = new LoginPage()
  const home = new HomePage()
  let userSession: string
  const authProfile = new AuthorizationProfile()
  const pd = new Products()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
    cy.clearCookies()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('api').as('api')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.getUserSession().then(() => {
      cy.get('@apiowner').then(({ user, namespace }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        home.useNamespace(namespace)
      })
    })
  })

  it('Update the Shared IDP Profile to an active clientID Secret auth environment', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.editProductEnvironment(product.name, product.test_environment.name)
      cy.get('@api').then(({ authorizationProfiles }: any) => {
        pd.updateCredentialIssuer(authorizationProfiles.shared_IDP_update_body)
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
    cy.clearCookies()
  })
})

describe('Developer creates an access request for Client ID/Secret authenticator', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const ma = new MyAccessPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
    cy.clearCookies()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    // cy.visit(login.path)
  })

  it('Developer logs in', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Creates an application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ clientCredentials }: any) => {
      app.createApplication(clientCredentials.clientIdSecret_sharedIDP.application)
    })
  })

  it('Creates an access request', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ clientCredentials, accessRequest }: any) => {
      let product = clientCredentials.clientIdSecret_sharedIDP.product
      let app = clientCredentials.clientIdSecret_sharedIDP.application

      apiDir.createAccessRequest(product, app, accessRequest)
      ma.clickOnGenerateSecretButton()

      cy.contains('Client ID').should('be.visible')
      cy.contains('Client Secret').should('be.visible')
      cy.contains('Token Endpoint').should('be.visible')
      cy.log(Cypress.env('clientidsecret'))
      ma.saveClientCredentials(false, true)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
    cy.clearCookies()
  })
})

describe('Verify that the service is accessible using new Client ID, Secret, and Access Token', () => {
  let token: string
  it('Get access token using client ID and secret; make API request for test environment', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {

      let cc = JSON.parse(store_res.clientidsecret)
      // let cc = JSON.parse(Cypress.env('clientidsecret'))
      cy.log('cc-->' + cc.clientSecret)
      cy.getAccessToken(cc.clientId, cc.clientSecret).then(() => {
        cy.get('@accessTokenResponse').then((token_res: any) => {
          token = token_res.body.access_token
          cy.request({
            url: Cypress.env('KONG_URL'),
            headers: {
              Host: 'a-service-for-newplatform-test.api.gov.bc.ca',
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

  it('Get access token using client ID and secret; make API request for Dev', () => {
    cy.request({
      url: Cypress.env('KONG_URL'),
      headers: {
        Host: 'a-service-for-newplatform.api.gov.bc.ca',
      },
      auth: {
        bearer: token,
      },
    }).then((res) => {
      expect(res.status).to.eq(200)
    })
  })
})
