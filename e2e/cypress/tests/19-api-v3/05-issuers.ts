describe('Authorization Profiles', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  describe('Happy Paths', () => {
    it('PUT /gateways/{gatewayId}/issuers', () => {
      const { gateway } = workingData
      cy.setRequestBody({
        name: `my-auth-profile-for-${gateway.gatewayId}`,
        description: 'Auth connection to my IdP',
        flow: 'client-credentials',
        clientAuthenticator: 'client-secret',
        mode: 'auto',
        inheritFrom: 'Sample Shared IdP',
      })
      cy.callAPI(`ds/api/v3/gateways/${gateway.gatewayId}/issuers`, 'PUT').then(
        ({ apiRes: { body, status } }: any) => {
          expect(status).to.be.equal(200)
          cy.log(JSON.stringify(body))
        }
      )
    })

    it('GET /gateways/{gatewayId}/issuers', () => {
      const { gateway } = workingData
      cy.callAPI(`ds/api/v3/gateways/${gateway.gatewayId}/issuers`, 'GET').then(
        ({ apiRes: { body, status } }: any) => {
          expect(status).to.be.equal(200)
          cy.log(JSON.stringify(body, null, 2))
          expect(body.length).to.be.equal(1)

          const issuer = body[0]

          expect(issuer.name).to.be.equal(`my-auth-profile-for-${gateway.gatewayId}`)
          expect(issuer.environmentDetails[1].environment).to.be.equal('test')
          expect(issuer.environmentDetails[1].issuerUrl).to.be.equal(
            Cypress.env('OIDC_ISSUER')
          )
          expect(issuer.environmentDetails[1].clientId).to.be.equal(
            `ap-my-auth-profile-for-${gateway.gatewayId}-test`
          )
        }
      )
    })
  })
})
