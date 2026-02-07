describe('SDX Subsystem', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  describe('Subsystem Happy Paths', () => {
    it('PUT /organizations/{org}/subsystems', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      const payload = {
        name: `SUBSYS-${datasetId.toUpperCase()}`,
      }
      cy.setRequestBody(payload)
      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/subsystems`, 'PUT').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
        }
      )
    })

    it('DELETE /organizations/{org}/subsystems/{name}', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      const payload = {
        name: `SUBSYS-${datasetId.toUpperCase()}-T2`,
      }
      cy.setRequestBody(payload)
      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/subsystems`, 'PUT').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.result).to.be.equal('created')

          cy.setQueryString({ force: false })
          cy.callAPI(
            `ds/api/sdx/v1/organizations/${org.name}/subsystems/${payload.name}`,
            'DELETE'
          ).then(({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)
            expect(body.result).to.be.equal('deleted')
          })
        }
      )
    })

    it('GET /organizations/{org}/subsystems', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      const payload = {
        name: `SUBSYS-${datasetId.toUpperCase()}`,
      }

      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/subsystems`, 'GET').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.length).to.be.equal(1)
          expect(JSON.stringify(body)).to.include(`SUBSYS-${datasetId.toUpperCase()}`)
          expect(body[0].name).to.be.equal(payload.name)
          expect(body[0]).to.have.property('gatewayId')
          expect(body[0].organization).to.be.equal(org.name)
        }
      )
    })
  })

  describe('Subsystem Sad Paths', () => {
    it('PUT /organizations/{org}/subsystems (invalid)', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      const payload = {
        name: `subsys-${datasetId.toUpperCase()}`,
      }
      cy.setRequestBody(payload)
      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/subsystems`, 'PUT').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(400)
          expect(body.result).to.be.equal('create-failed')
          expect(body.reason).to.be.equal(
            "Subsystem name must be between 3 and 20 uppercase alpha-numeric characters (including special character '-')"
          )
        }
      )
    })

    it('DELETE /organizations/{org}/subsystems/{name} (not exists)', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      const payload = {
        name: `SUBSYS-${datasetId.toUpperCase()}-T2`,
      }
      cy.setQueryString({ force: false })
      cy.callAPI(
        `ds/api/sdx/v1/organizations/${org.name}/subsystems/${payload.name}`,
        'DELETE'
      ).then(({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(422)
        expect(body.message).to.be.equal('Subsystem not found')
      })
    })

    it('GET /organizations/{org}/subsystems/{name}/client (incomplete setup)', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      const payload = {
        name: `SUBSYS-${datasetId.toUpperCase()}`,
      }

      cy.callAPI(
        `ds/api/sdx/v1/organizations/${org.name}/subsystems/${payload.name}/client`,
        'GET'
      ).then(({ apiRes: { status, body } }: any) => {
        // expect(JSON.stringify(body)).to.include(`abc`)
        expect(body.message).to.be.equal('Incomplete subsystem setup')
        expect(body.fields['inputs.service_locator'].message).to.be.equal(
          'missing gateway details'
        )
      })
    })
  })
})
