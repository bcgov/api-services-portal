describe('Gateways', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  describe('Happy Paths', () => {
    it('POST /gateways', () => {
      const payload = {
        displayName: 'My ABC Gateway',
      }
      cy.setRequestBody(payload)
      cy.callAPI('ds/api/v3/gateways', 'POST').then(
        ({ apiRes: { body, status } }: any) => {
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
        }
      )
    })

    it('POST /gateways (with gatewayId)', () => {
      const { v4: uuidv4 } = require('uuid')
      const customId = uuidv4().replace(/-/g, '').toLowerCase().substring(0, 3)

      const payload = {
        gatewayId: `custom-${customId}-gw`,
        displayName: 'My ABC Gateway',
      }
      cy.log(JSON.stringify(payload))
      cy.setRequestBody(payload)
      cy.callAPI('ds/api/v3/gateways', 'POST').then(
        ({ apiRes: { body, status } }: any) => {
          cy.log(body)
          expect(status).to.be.equal(200)
          expect(body.gatewayId).to.be.equal(payload.gatewayId)
          expect(body.displayName).to.be.equal(payload.displayName)
        }
      )
    })

    it('POST /gateways (no displayname)', () => {
      const { v4: uuidv4 } = require('uuid')
      const customId = uuidv4().replace(/-/g, '').toLowerCase().substring(0, 10)
      const payload = {
        gatewayId: `a${customId}a`,
      }
      cy.log(JSON.stringify(payload))
      cy.setRequestBody(payload)
      cy.callAPI('ds/api/v3/gateways', 'POST').then(
        ({ apiRes: { body, status } }: any) => {
          const match = {
            gatewayId: payload.gatewayId,
            displayName: "janis's Gateway",
          }
          expect(status).to.be.equal(200)
          expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))
        }
      )
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
  describe('Error Paths', () => {
    it('POST /gateways (bad gatewayId)', () => {
      const payload = {
        gatewayId: `CAP-LETTERS`,
        displayName: 'My ABC Gateway',
      }
      cy.log(JSON.stringify(payload))
      cy.setRequestBody(payload)
      cy.callAPI('ds/api/v3/gateways', 'POST').then(
        ({ apiRes: { body, status } }: any) => {
          const match = {
            message: 'Validation Failed',
            details: {
              d0: {
                message:
                  'Namespace name must be between 5 and 15 alpha-numeric lowercase characters and start and end with an alphabet.',
              },
            },
          }
          expect(status).to.be.equal(422)
          expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))
        }
      )
    })
  })
})
