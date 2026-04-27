/**
 * Builds a new subsystem and service
 *
 * @param org
 * @param subsystemName
 * @param next
 */
function new_service(org: any, subsystemName: string, next: any) {
  const payload = {
    name: subsystemName,
  }
  cy.setRequestBody(payload)
  cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/subsystems`, 'PUT').then(
    ({ apiRes: { status } }: any) => {
      expect(status).to.be.equal(200)

      cy.get('@toys.v1').then((text: any) => {
        expect(Cypress.Buffer.isBuffer(text)).to.be.true
        const body = text.toString()
        expect(body).to.include('openapi: 3.1.1')

        cy.setRequestBodyRaw(body)
        cy.setHeader('Content-Type', 'application/octet-stream')
        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/oas-services?subsystem=${subsystemName}`,
          'PUT',
          false
        ).then(({ apiRes: { status, body } }: any) => {
          // expect(status).to.be.equal(200)
          expect(JSON.stringify(body)).to.include('created')
          cy.callAPI(
            `ds/api/sdx/v1/organizations/${org.name}/oas-services`,
            'GET',
            false
          ).then(({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)
            assert(body.length > 0, 'Expected at least one service in response')
            next(body[0])
          })
        })
      })
    }
  )
}

describe('SDX Connection Requests', () => {
  let workingData: any
  let diffOrg: any

  beforeEach(() => {
    cy.fixture('toys.v1.yaml', null).as('toys.v1')

    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
      cy.buildOrgGatewayDatasetAndProduct().then((data) => {
        diffOrg = data
      })
    })
  })

  describe('Connection Requests Happy Paths', () => {
    it('GET /organizations/{org}/connections', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'GET').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.length).to.be.equal(0)
        }
      )
    })

    it('PUT /organizations/{org}/connections - New', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      new_service(org, `SUBSYS-${datasetId.toUpperCase()}`, (service: any) => {
        const clientId = service.subsystem.clientId
        const serviceId = service.name
        const payload = {
          clientId: `${clientId}`,
          serviceId: `${serviceId}`,
        }
        cy.setRequestBody(payload)
        cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'PUT').then(
          ({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)
            expect(body.result).to.be.equal('created')
            expect(typeof body.id).to.be.equal('string')
          }
        )
      })
    })

    it('PUT /organizations/{org}/connections - Approve', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      new_service(org, `SUBSYS-${datasetId.toUpperCase()}`, (service: any) => {
        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/oas-services`,
          'GET',
          false
        ).then(({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.length).to.be.equal(1)
          const service = body[0]
          const clientId = service.subsystem.clientId
          const serviceId = service.name
          const payload: any = {
            clientId: `${clientId}`,
            serviceId: `${serviceId}`,
          }
          // first expect no changes
          cy.setRequestBody(payload)
          cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'PUT').then(
            ({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(200)
              expect(body.result).to.be.equal('created')
              expect(typeof body.id).to.be.equal('string')

              cy.callAPI(
                `ds/api/sdx/v1/organizations/${org.name}/connections`,
                'PUT'
              ).then(({ apiRes: { status, body } }: any) => {
                expect(status).to.be.equal(200)
                expect(body.result).to.be.equal('no-change')
                expect(typeof body.id).to.be.equal('string')

                // then mark it approved and expect an updated record
                payload.isApproved = true

                cy.setRequestBody(payload)
                cy.callAPI(
                  `ds/api/sdx/v1/organizations/${org.name}/connections`,
                  'PUT'
                ).then(({ apiRes: { status, body } }: any) => {
                  expect(status).to.be.equal(200)
                  expect(body.result).to.be.equal('updated')
                  expect(typeof body.id).to.be.equal('string')
                })
              })
            }
          )
        })
      })
    })
  })

  describe('Connection Requests Sad Paths', () => {
    it('PUT /organizations/{org}/connections - Invalid clientId format', () => {
      const { org } = workingData

      const payload = {
        clientId: `some-client-id`,
        serviceId: `some-service-id`,
      }
      cy.setRequestBody(payload)
      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'PUT').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(422)
          expect(body.message).to.be.equal('Invalid client id format')
        }
      )
    })

    it('PUT /organizations/{org}/connections - Invalid clientId', () => {
      const { org } = workingData

      const payload = {
        clientId: `LAB.MIN.ABCD.MY-SYSTEM`,
        serviceId: `LAB.MIN.ABCD.SERVICE.v1`,
      }
      cy.setRequestBody(payload)
      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'PUT').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(422)
          //expect(JSON.stringify(body)).to.be.equal('dsd')
          expect(body.message).to.be.equal('Subsystem not found')
        }
      )
    })

    it('PUT /organizations/{org}/connections - org mismatch', () => {
      const { org } = workingData

      new_service(org, `SUBSYS`, (service: any) => {
        new_service(diffOrg.org, `SUBSYS`, (service: any) => {
          const diffClientId = service.subsystem.clientId
          // const diffServiceId = service.name

          cy.callAPI(
            `ds/api/sdx/v1/organizations/${org.name}/oas-services`,
            'GET',
            false
          ).then(({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)
            expect(body.length).to.be.equal(1)
            const service = body[0]
            // const clientId = service.subsystem.clientId
            const serviceId = service.name

            const payload = {
              clientId: `${diffClientId}`,
              serviceId: `${serviceId}`,
            }
            cy.setRequestBody(payload)
            cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'PUT').then(
              ({ apiRes: { status, body } }: any) => {
                expect(status).to.be.equal(422)
                expect(body.message).to.be.equal('Validation Failed')
                expect(body.fields.clientId.message).to.be.equal(
                  'Only client subsystems can create connection requests for their own organization'
                )
              }
            )
          })
        })
      })
    })

    it('PUT /organizations/{org}/connections - approval org mismatch', () => {
      const { org } = workingData

      new_service(org, `SUBSYS`, (service: any) => {
        new_service(diffOrg.org, `SUBSYS`, (service: any) => {
          const diffClientId = service.subsystem.clientId
          const diffServiceId = service.name

          cy.callAPI(
            `ds/api/sdx/v1/organizations/${org.name}/oas-services`,
            'GET',
            false
          ).then(({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)
            expect(body.length).to.be.equal(1)
            const service = body[0]
            const clientId = service.subsystem.clientId
            const serviceId = service.name

            const payload: any = {
              clientId: `${clientId}`,
              serviceId: `${diffServiceId}`,
            }
            cy.setRequestBody(payload)
            cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'PUT').then(
              ({ apiRes: { status, body } }: any) => {
                expect(status).to.be.equal(200)

                payload.isApproved = true
                cy.setRequestBody(payload)
                cy.callAPI(
                  `ds/api/sdx/v1/organizations/${org.name}/connections`,
                  'PUT'
                ).then(({ apiRes: { status, body } }: any) => {
                  expect(status).to.be.equal(422)
                  // expect(JSON.stringify(body)).to.be.equal('dsd')

                  expect(body.message).to.be.equal('Validation Failed')
                  expect(body.fields.isApproved.message).to.be.equal(
                    'Cannot approve connection request when service organization does not match the specified organization'
                  )
                })
              }
            )
          })
        })
      })
    })
  })
})
