import {
  createConnection,
  createSubsystemAndOASService,
} from '../../../support/sdx-commands'

describe('SDX OpenAPI Services', () => {
  let workingData: any

  beforeEach(() => {
    cy.fixture('toys.v1.yaml', null).as('toys.v1')
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  describe('OpenAPI Services Happy Paths', () => {
    it('GET /services', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/oas-services`, 'GET').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.length).to.be.equal(0)
        }
      )
    })

    it('PUT /organizations/{org}/oas-services', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      const payload = {
        name: `SUBSYS-${datasetId.toUpperCase()}`,
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
              `ds/api/sdx/v1/organizations/${org.name}/oas-services?subsystem=${payload.name}`,
              'PUT',
              false
            ).then(({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(200)
              expect(body.result).to.be.equal('created')
              expect(typeof body.id).to.be.equal('string')
              expect(body).has.property('refKey')
            })
          })
        }
      )
    })

    it('GET /organizations/{org}/oas-services/{id}', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      const payload = {
        name: `SUBSYS-${datasetId.toUpperCase()}`,
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
              `ds/api/sdx/v1/organizations/${org.name}/oas-services?subsystem=${payload.name}`,
              'PUT',
              false
            ).then(({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(200)

              const specRefKey = body.refKey

              cy.callAPI(
                `ds/api/sdx/v1/organizations/${org.name}/oas-services/${specRefKey}`,
                'GET'
              ).then(({ apiRes: { status, body } }: any) => {
                expect(status).to.be.equal(200)

                const service = body
                expect(service).to.have.property('name')
                expect(service).to.have.property('title')
                expect(service).to.have.property('version')
                expect(service).to.have.property('title')
                expect(service).to.have.property('description')
                expect(service).to.have.property('subsystem')
                expect(service).to.have.property('operations')
              })
            })
          })
        }
      )
    })

    it('DELETE /organizations/{org}/oas-services/{id}', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      const payload = {
        name: `SUBSYS-${datasetId.toUpperCase()}`,
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
              `ds/api/sdx/v1/organizations/${org.name}/oas-services?subsystem=${payload.name}`,
              'PUT',
              false
            ).then(({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(200)
              expect(body).has.property('refKey')

              cy.setRequestBody(undefined)
              cy.setQueryString({ force: false })
              cy.callAPI(
                `ds/api/sdx/v1/organizations/${org.name}/oas-services/${body.refKey}`,
                'DELETE',
                false
              ).then(({ apiRes: { status, body } }: any) => {
                expect(status).to.be.equal(200)
                expect(body.result).to.be.equal('deleted')
              })
            })
          })
        }
      )
    })

    it('DELETE /organizations/{org}/oas-services/{id} - name can be reused after delete', () => {
      const { org, datasetId } = workingData

      const subsystemName = `SUBSYS-${datasetId.toUpperCase()}`
      createSubsystemAndOASService(org, subsystemName, (service: any) => {
        cy.setRequestBody(undefined)
        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/oas-services/${service.name}`,
          'DELETE',
          false
        ).then(({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.result).to.be.equal('deleted')

          cy.get('@toys.v1').then((text: any) => {
            const body = text.toString()

            cy.setRequestBodyRaw(body)
            cy.setHeader('Content-Type', 'application/octet-stream')
            cy.callAPI(
              `ds/api/sdx/v1/organizations/${org.name}/oas-services?subsystem=${subsystemName}`,
              'PUT',
              false
            ).then(({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(200)
              expect(body.result).to.be.equal('created')
              expect(body).has.property('refKey')
            })
          })
        })
      })
    })
  })

  describe('OpenAPI Services Sad Paths', () => {
    it('DELETE /organizations/{org}/oas-services/{id} - active connection request exists', () => {
      const { org, datasetId } = workingData

      createSubsystemAndOASService(
        org,
        `SUBSYS-${datasetId.toUpperCase()}`,
        (service: any) => {
          createConnection(org, service.subsystem.clientId, service.name, () => {
            cy.setRequestBody(undefined)
            cy.callAPI(
              `ds/api/sdx/v1/organizations/${org.name}/oas-services/${service.name}`,
              'DELETE',
              false
            ).then(({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(422)
              expect(body.message).to.be.equal(
                'OAS service cannot be deleted because it has active connection requests'
              )
            })
          })
        }
      )
    })
  })
})
