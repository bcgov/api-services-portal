import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import AuthorizationProfile from '../../pageObjects/authProfile'
import ConsumersPage from '../../pageObjects/consumers'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'
import Products from '../../pageObjects/products'


describe('Apply Shared IDP while creating Authorization Profile', () => {
  const login = new LoginPage()
  var nameSpace: string
  const home = new HomePage()
  const authProfile = new AuthorizationProfile()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/regen').as('regen')
    cy.visit(login.path)
  })

  it('Authenticates api owner', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })
  it('Activates the namespace', () => {
    cy.getUserSession().then(() => {
      cy.get('@apiowner').then(({ namespace }: any) => {
        nameSpace = namespace
        home.useNamespace(namespace)
      })
    })
  })

  it('Create an authorization profile', () => {
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
      cy.setRequestBody(authorizationProfiles.shared_IDP_body)
    })
  })

  it('Put the resource and verify the success code in the response', () => {
    cy.get('@apiowner').then(({ namespace }: any) => {
      cy.makeAPIRequest('ds/api/v2/namespaces/'+namespace+'/issuers', 'PUT').then((response) => {
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
        authProfile.verifyAuthorizationProfileIssuerURL(authorizationProfiles.shared_IDP_body.environmentDetails[0].issuerUrl)
      })
    })
  })
})