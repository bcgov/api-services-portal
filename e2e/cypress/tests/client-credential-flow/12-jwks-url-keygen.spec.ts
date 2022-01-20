const fs = require('fs')
const jose = require('node-jose')

describe('Generates public/private key and publishes public key to JWKS URL', () => {
  it('Generates, saves keys', () => {
    let keyStore = jose.JWK.createKeyStore()
    keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' }).then((result: any) => {
      cy.saveState('jwksUrlKeys', JSON.stringify(keyStore.toJSON(true), null, '  '))
    })
  })

  it('Publishes public key to JWKS URL', () => {
    cy.getState('jwksUrlKeys').then((keys: any) => {
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
