import LoginPage from '../../pageObjects/login'
const njwt = require('njwt')
const jose = require('node-jose')

describe('Make an API request using JWKS URL flow with JWT signed with generated private key', () => {
  it('Get access token using JWT key pair; make API request', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {
      let jwkCred = JSON.parse(store_res.jwksUrlCredentials)
      let ks = store_res.jwksUrlKeys

      cy.log(ks)

      let tokenEndpoint = jwkCred.tokenEndpoint
      let issuer = jwkCred.issuer

      jose.JWK.asKeyStore(ks).then((keyStore: { all: (arg0: { use: string }) => [any] }) => {
        cy.log(keyStore.toString())
        const [key] = keyStore.all({ use: 'sig' })

        const privateKey = key.toPEM(true)
        let clientId = jwkCred.clientId
        let now = Math.floor(new Date().getTime() / 1000)
        const plus5Minutes = new Date((now + 5 * 60) * 1000)
        const alg = 'RS256'

        let claims = {
          aud: issuer,
        }

        let jwt = njwt
          .create(claims, privateKey, alg)
          .setIssuedAt(now)
          .setExpiration(plus5Minutes)
          .setIssuer(clientId)
          .setSubject(clientId)
          .compact()

        cy.request({
          url: tokenEndpoint,
          method: 'POST',
          body: {
            grant_type: 'client_credentials',
            client_id: clientId,
            scopes: 'openid',
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: jwt,
          },
          form: true,
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
