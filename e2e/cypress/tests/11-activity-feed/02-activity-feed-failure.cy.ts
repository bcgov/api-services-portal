import ActivityPage from "../../pageObjects/activity"
import ApiDirectoryPage from "../../pageObjects/apiDirectory"
import ApplicationPage from "../../pageObjects/applications"
import AuthorizationProfile from "../../pageObjects/authProfile"
import HomePage from "../../pageObjects/home"
import LoginPage from "../../pageObjects/login"
import MyAccessPage from '../../pageObjects/myAccess'
import Products from "../../pageObjects/products"
import ServiceAccountsPage from "../../pageObjects/serviceAccounts"
let userSession: any
let nameSpace: string
let response: any

describe('Make the access request for invalid profile', () => {

  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const ma = new MyAccessPage()

  before(() => {
    cy.visit('/')
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
      app.createApplication(clientCredentials.clientIdSecret_invalid.application)
    })
  })

  // it('Creates an access request', (done) => {
  //   cy.visit(apiDir.path)
  //   cy.get('@developer').then(({ clientCredentials, accessRequest }: any) => {
  //     let product = clientCredentials.clientIdSecret_invalid.product
  //     let app = clientCredentials.clientIdSecret_invalid.application

  //     apiDir.createAccessRequest(product, app, accessRequest)
  //     ma.clickOnGenerateSecretButton()
  //     // ma.closeRequestAccessPopUp()
  //   })
  // })
  after(() => {
    cy.logout()
  })
})

describe('Create API, Product, and Authorization Profiles; Apply Auth Profiles to Product Environments', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const sa = new ServiceAccountsPage()
  const pd = new Products()
  const authProfile = new AuthorizationProfile()
  const activity = new ActivityPage()
  var nameSpace: string
  let userSession: string

  before(() => {
    cy.visit('/')
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('api').as('api')
    cy.fixture('common-testdata').as('common-testdata')
  })
  it('Authenticates api owner', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })
  it('Activates namespace for client credential flow tests', () => {
    cy.getUserSession().then(() => {
      cy.get('@common-testdata').then(({ clientCredentials }: any) => {
        nameSpace = clientCredentials.namespace
        cy.activateGateway(clientCredentials.namespace)
        cy.get('@login').then(function (xhr: any) {
          userSession = xhr.response.headers['x-auth-request-access-token']
        })
      })
    })
  })

  it('Get the resource and verify the success code in the response', () => {
    cy.get('@api').then(({ namespaces }: any) => {
      cy.makeAPIRequest(namespaces.endPoint + "/" + nameSpace + "/activity?first=100", 'GET').then((res:any) => {
        expect(res.apiRes.status).to.be.equal(200)
        response = res.apiRes.body
      })
    })
  })

  it('Navigate to activity page', () => {
    cy.visit(activity.path)
  })

  it('Load all the records by click on "Load More" button', () => {
    activity.loadMoreRecords()
  })

  it('Verify Activity filter foe all the listed activities', () => {
    activity.checkActivityFilter("User", "", response)
  })

  after(() => {
    cy.logout()
  })
})