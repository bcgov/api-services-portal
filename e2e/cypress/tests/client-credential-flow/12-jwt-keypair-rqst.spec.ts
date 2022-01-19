import LoginPage from '../../pageObjects/login'
const njwt = require('njwt');


describe('Make an API request using client ID, secret, and access token', () => {
  const login = new LoginPage()

  before(() => {
    cy.visit('/')
    cy.clearCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.visit(login.path)
  })

  it('Get access token using JWT key pair; make API request', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {
      cy.readFile('cypress/fixtures/state/privateKey.pem').then((privateKey) => {
        let jwkCred = JSON.parse(store_res.jwksCredentials)
        let clientId = jwkCred.clientId
        let tokenEndpoint = jwkCred.tokenEndpoint

        let now = Math.floor( new Date().getTime() / 1000 );
        let plus5Minutes = new Date( ( now + (5*60) ) * 1000);
        let alg = 'RS256';

        let claims = {
          aud: "http://keycloak.localtest.me:9080/auth/realms/master"
        };

        let jwt = njwt.create(claims, privateKey, alg)
          .setIssuedAt(now)
          .setExpiration(plus5Minutes)
          .setIssuer(clientId)
          .setSubject(clientId)
          .compact();

        cy.request({
          url: tokenEndpoint,
          method: 'POST',
          body: {
            grant_type: 'client_credentials',
            client_id: clientId,
            scopes: 'openid',
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: jwt
          },
          form: true
        }).then((res) => {
          let token = res.body.access_token
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
