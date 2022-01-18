// import LoginPage from '../../pageObjects/login'


// describe('Make an API request using JWKS', () => {
//   const login = new LoginPage()
//   const njwt = require('njwt');

//   before(() => {
//     cy.visit('/')
//     cy.clearCookies()
//     cy.reload()
//   })

//   beforeEach(() => {
//     cy.preserveCookies()
//     cy.visit(login.path)
//   })

//   it('Get access token using client ID and secret; make API request', () => {
//     cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {
//       let jwksCred = store_res.jwksCredentials
//       const privateKey = JSON.parse(jwksCred);

//       cy.log(jwksCred.clientId)

//       // let clientId = jwksCred.clientId;
//       // let now = Math.floor( new Date().getTime() / 1000 );
//       // let plus5Minutes = new Date( ( now + (5*60) ) * 1000);
//       // let alg = 'RS256';
//       // let claims = {
//       //   aud: "http://keycloak.localtest.me:9080/auth/realms/master"
//       // }

//       // let jwt = njwt.create(claims, privateKey, alg)
//       // .setIssuedAt(now)
//       // .setExpiration(plus5Minutes)
//       // .setIssuer(clientId)
//       // .setSubject(clientId)
//       // .compact();

//       // cy.request({
//       //   method: 'POST',
//       //   url: Cypress.env('TOKEN_URL'),
//       //   body: {
//       //     grant_type: 'client_credentials',
//       //     scopes: 'openid',
//       //     client_id: clientId,
//       //     client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
//       //     client_assertion: jwt
//       //   }
//       // }).then((res) => {
//       //   // cy.wrap(res).as('accessTokenResponse')
//       //   expect(res.status).to.eq(200)
//       // })
//     })
//   })

// })


import LoginPage from '../../pageObjects/login'

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

  it('Get access token using client ID and secret; make API request', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {
      let cc = JSON.parse(store_res.jwksCredentials)
      const privateKey = cc.privateKey
      
      /*
      There seems to be an issue parsing the key files.
      Try using the method outline in the docs to save a pem
      key then load here
      https://github.com/bcgov/gwa-api/blob/dev/docs/guides/intro-signed-jwt.md
      */

      cy.log(privateKey)
    })
  })
})
