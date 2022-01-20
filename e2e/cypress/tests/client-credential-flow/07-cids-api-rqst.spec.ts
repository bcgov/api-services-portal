describe('Make an API request using client ID, secret, and access token', () => {
  it('Get access token using client ID and secret; make API request', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {
      let cc = JSON.parse(store_res.clientCredentials)
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
