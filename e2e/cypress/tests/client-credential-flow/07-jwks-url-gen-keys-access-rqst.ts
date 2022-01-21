import LoginPage from '../../pageObjects/login'
import ApplicationPage from '../../pageObjects/applications'
import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import MyAccessPage from '../../pageObjects/myAccess'

const jose = require('node-jose')

describe('Generates public/private key and publishes public key to JWKS URL', () => {
  it('Generates, saves keys', () => {
    let keyStore = jose.JWK.createKeyStore()
    keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' }).then((result: any) => {
      cy.saveState('jwksurlkeys', JSON.stringify(keyStore.toJSON(true), null, '  '))
    })
  })

  it('Publishes public key to JWKS URL', () => {
    cy.getState('jwksurlkeys').then((keys: any) => {
      cy.log(keys)
      jose.JWK.asKeyStore(keys).then((keyStore: { toJSON: () => any }) => {
        cy.request({
          url: Cypress.env('JWKS_URL'),
          method: 'POST',
          body: keyStore.toJSON(),
          form: true,
        }).then((res) => {
          expect(res.status).to.eq(200)
        })
      })
    })
  })
})

describe('Developer creates an access request for JWKS URL', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const ma = new MyAccessPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    cy.visit(login.path)
  })

  it('Developer logs in', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Creates an application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ clientCredentials }: any) => {
      app.createApplication(clientCredentials.jwksUrl.application)
    })
  })

  it('Creates an access request', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ clientCredentials, accessRequest }: any) => {
      let jwksUrl = clientCredentials.jwksUrl

      apiDir.createAccessRequest(jwksUrl.product, jwksUrl.application, accessRequest)
      ma.clickOnGenerateSecretButton()

      cy.contains('Client ID').should('be.visible')
      cy.contains('Issuer').should('be.visible')
      cy.contains('Token Endpoint').should('be.visible')

      ma.saveJwksUrlCredentials()
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})