describe('SDX OpenAPI Services', () => {
  let workingData: any

  beforeEach(() => {
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

          cy.request({
            url: 'https://bcgov.github.io/sdx-openapi/Toys.v1.yaml',
          }).then((fileResponse) => {
            const blob = Cypress.Blob.binaryStringToBlob(
              fileResponse.body,
              'application/x-yaml'
            )
            const formData = new FormData()
            formData.append('configFile', blob, 'file.yaml')
            formData.append('subsystem', payload.name)

            cy.setRequestFormData(formData)
            cy.callAPI(
              `ds/api/sdx/v1/organizations/${org.name}/oas-services`,
              'PUT',
              true
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

          cy.request({
            url: 'https://bcgov.github.io/sdx-openapi/Toys.v1.yaml',
          }).then((fileResponse) => {
            const blob = Cypress.Blob.binaryStringToBlob(
              fileResponse.body,
              'application/x-yaml'
            )
            const formData = new FormData()
            formData.append('configFile', blob, 'file.yaml')
            formData.append('subsystem', payload.name)

            cy.setRequestFormData(formData)
            cy.callAPI(
              `ds/api/sdx/v1/organizations/${org.name}/oas-services`,
              'PUT',
              true
            ).then(({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(200)

              const specRefKey = body.refKey

              cy.callAPI(
                `ds/api/sdx/v1/organizations/${org.name}/oas-services/${specRefKey}`,
                'GET'
              ).then(({ apiRes: { status, body } }: any) => {
                expect(status).to.be.equal(200)

                const service = body
                expect(service).to.have.property('id')
                expect(service).to.have.property('title')
                expect(service).to.have.property('version')
                expect(service).to.have.property('title')
                expect(service).to.have.property('description')
                expect(['active', 'archived']).to.include(service.state)
                expect(service).to.have.property('state')
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

          cy.request({
            url: 'https://bcgov.github.io/sdx-openapi/Toys.v1.yaml',
          }).then((fileResponse) => {
            const blob = Cypress.Blob.binaryStringToBlob(
              fileResponse.body,
              'application/x-yaml'
            )
            const formData = new FormData()
            formData.append('configFile', blob, 'file.yaml')
            formData.append('subsystem', payload.name)

            cy.setRequestFormData(formData)
            cy.callAPI(
              `ds/api/sdx/v1/organizations/${org.name}/oas-services`,
              'PUT',
              true
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
              })
            })
          })
        }
      )
    })
  })
})
