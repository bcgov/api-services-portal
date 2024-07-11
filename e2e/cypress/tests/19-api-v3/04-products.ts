describe('Products', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  describe('Happy Paths', () => {
    it('PUT /gateways/{gatewayId}/products', () => {
      const { gateway } = workingData
      cy.setRequestBody({
        name: `my-product-on-${gateway.gatewayId}`,
        environments: [
          {
            name: 'dev',
            active: false,
            approval: false,
            flow: 'public',
          },
        ],
      })
      cy.callAPI(`ds/api/v3/gateways/${gateway.gatewayId}/products`, 'PUT').then(
        ({ apiRes: { body, status } }: any) => {
          expect(status).to.be.equal(200)
          cy.log(JSON.stringify(body))
        }
      )
    })

    it('GET /gateways/{gatewayId}/products', () => {
      const { gateway } = workingData
      cy.callAPI(`ds/api/v3/gateways/${gateway.gatewayId}/products`, 'GET').then(
        ({ apiRes: { body, status } }: any) => {
          expect(status).to.be.equal(200)
          cy.log(JSON.stringify(body, null, 2))
          expect(body.length).to.be.equal(1)
          expect(body[0].name).to.be.equal(`my-product-on-${gateway.gatewayId}`)
          expect(body[0].environments.length).to.be.equal(1)
        }
      )
    })
  })
})
