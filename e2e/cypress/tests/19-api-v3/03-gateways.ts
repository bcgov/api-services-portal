describe('Gateways', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  it('POST /gateways', () => {
    const payload = {
      displayName: 'My ABC Gateway',
    }
    cy.setRequestBody(payload)
    cy.callAPI('ds/api/v3/gateways', 'POST').then(({ apiRes: { body, status } }: any) => {
      expect(status).to.be.equal(200)
      cy.log(JSON.stringify(body, null, 2))
      expect(body.displayName).to.be.equal(payload.displayName)

      const gateway = body

      cy.callAPI(`ds/api/v3/gateways/${gateway.gatewayId}`, 'GET').then(
        ({ apiRes: { body, status } }: any) => {
          expect(status).to.be.equal(200)
          cy.log(JSON.stringify(body, null, 2))
          expect(body.displayName).to.be.equal(gateway.displayName)
        }
      )

      cy.callAPI(`ds/api/v3/gateways/${gateway.gatewayId}/activity`, 'GET').then(
        ({ apiRes: { body, status } }: any) => {
          expect(status).to.be.equal(200)
          cy.log(JSON.stringify(body, null, 2))
          expect(body.length).to.be.equal(1)
          expect(body[0].message).to.be.equal('{actor} created {ns} namespace')
          expect(body[0].params.ns).to.be.equal(gateway.gatewayId)
        }
      )
    })
  })

  it('GET /gateways/{gatewayId}', () => {
    const { gateway } = workingData
    cy.callAPI(`ds/api/v3/gateways/${gateway.gatewayId}`, 'GET').then(
      ({ apiRes: { body, status } }: any) => {
        expect(status).to.be.equal(200)
        cy.log(JSON.stringify(body, null, 2))
        expect(body.displayName).to.be.equal(gateway.displayName)
      }
    )
  })

  it('GET /gateways/{gatewayId}/activity', () => {
    const { gateway } = workingData
    cy.callAPI(`ds/api/v3/gateways/${gateway.gatewayId}/activity`, 'GET').then(
      ({ apiRes: { body, status } }: any) => {
        expect(status).to.be.equal(200)
        cy.log(JSON.stringify(body, null, 2))
        expect(body.length).to.be.equal(3)
        expect(body[2].message).to.be.equal('{actor} created {ns} namespace')
        expect(body[2].params.ns).to.be.equal(gateway.gatewayId)
      }
    )
  })

  //   it('DELETE /gateways/{gatewayId}', () => {
  //     const { gateway } = workingData
  //     cy.callAPI(`ds/api/v3/gateways/${gateway.gatewayId}`, 'DELETE').then(
  //       ({ apiRes: { body, status } }: any) => {
  //         expect(status).to.be.equal(200)
  //         cy.log(JSON.stringify(body, null, 2))
  //       }
  //     )
  //   })
})
