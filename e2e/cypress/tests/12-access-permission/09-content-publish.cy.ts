import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'



describe('Verify Content Publish Permission', () => {
  const login = new LoginPage()
  const home = new HomePage()
  let token: any

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('api').as('api')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ checkPermission }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        home.useNamespace(checkPermission.namespace)
      })
    })
  })

  it('Get the authorization token for the service account created with out "Content.Publish" permission', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {
      let cc = JSON.parse(store_res.credentials)
      cy.getAccessToken(cc.clientId, cc.clientSecret).then(() => {
        cy.get('@accessTokenResponse').then((token_res: any) => {
          token = token_res.body.access_token
        })
      })
    })
  })

  it('Prepare the Request Specification for the API', () => {
    cy.get('@api').then(({ documentation }: any) => {
      cy.setHeaders(documentation.headers)
      cy.setAuthorizationToken(token)
      cy.setRequestBody(documentation.body)
    })
  })

  it('Verify that the document is not published without "Content.Publish" permission', () => {
    cy.get('@api').then(({ documentation }: any) => {
      cy.makeAPIRequest(documentation.endPoint, 'PUT').then((response:any) => {
        expect(response.apiRes.status).to.be.equal(401)
        expect(response.apiRes.body.message).contain('Missing authorization scope')
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
