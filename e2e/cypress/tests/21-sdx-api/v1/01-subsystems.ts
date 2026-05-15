import {
  clientIdForSubsystem,
  createConnection,
  createRuntimeGroup,
  createSubsystem,
  createSubsystemAndOASService,
  uniqueSubsystemName,
} from '../../../support/sdx-commands'

describe('SDX Subsystem', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  describe('Subsystem Happy Paths', () => {
    it('PUT /organizations/{org}/subsystems', () => {
      const { org } = workingData
      const subsystemName = uniqueSubsystemName()

      createSubsystem(org, subsystemName, ({ result }: any) => {
        expect(result).to.be.equal('created')
      })
    })

    it('DELETE /organizations/{org}/subsystems/{name}', () => {
      const { org } = workingData
      const subsystemName = uniqueSubsystemName()

      createSubsystem(org, subsystemName, ({ result }: any) => {
        expect(result).to.be.equal('created')

        cy.setQueryString({ force: false })
        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystemName}`,
          'DELETE'
        ).then(({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.result).to.be.equal('deleted')
        })
      })
    })

    it('DELETE /organizations/{org}/subsystems/{name} - deletes related OAS services when no active connections or gateway config exist', () => {
      const { org } = workingData
      const subsystemName = uniqueSubsystemName()

      createSubsystemAndOASService(org, subsystemName, (service: any) => {
        cy.setQueryString({ force: false })
        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystemName}`,
          'DELETE',
          false
        ).then(({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.result).to.be.equal('deleted')
          expect(body.childResults.length).to.be.greaterThan(0)

          cy.callAPI(
            `ds/api/sdx/v1/organizations/${org.name}/oas-services/${service.name}`,
            'GET',
            false
          ).then(({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(422)
            expect(body.message).to.be.equal('Service not found')
          })
        })
      })
    })

    it('DELETE /organizations/{org}/subsystems/{name} - name can be reused after delete', () => {
      const { org } = workingData
      const subsystemName = uniqueSubsystemName()

      createSubsystem(org, subsystemName, ({ result }: any) => {
        expect(result).to.be.equal('created')

        cy.setQueryString({ force: false })
        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystemName}`,
          'DELETE'
        ).then(({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.result).to.be.equal('deleted')

          createSubsystem(org, subsystemName, ({ result }: any) => {
            expect(result).to.be.equal('created')
          })
        })
      })
    })

    it('GET /organizations/{org}/subsystems', () => {
      const { org } = workingData
      const subsystemName = uniqueSubsystemName()

      createSubsystem(org, subsystemName, () => {
        cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/subsystems`, 'GET').then(
          ({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)
            expect(body.length).to.be.greaterThan(0)
            expect(JSON.stringify(body)).to.include(subsystemName)

            const subsystem = body.find((entry: any) => entry.name === subsystemName)
            expect(subsystem).to.have.property('gatewayId')
            expect(subsystem.organization).to.be.equal(org.name)
          }
        )
      })
    })

    it('GET /organizations/{org}/clients', () => {
      const { org } = workingData

      cy.setQueryString({})
      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/clients`, 'GET').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.length).to.be.equal(0)
        }
      )
    })
  })

  describe('Subsystem Sad Paths', () => {
    it('PUT /organizations/{org}/subsystems (invalid)', () => {
      const { org, datasetId } = workingData

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
      const { org } = workingData
      const missingSubsystemName = uniqueSubsystemName()

      cy.setQueryString({ force: false })
      cy.callAPI(
        `ds/api/sdx/v1/organizations/${org.name}/subsystems/${missingSubsystemName}`,
        'DELETE'
      ).then(({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(422)
        expect(body.message).to.be.equal('Subsystem not found')
      })
    })

    it('DELETE /organizations/{org}/subsystems/{name} - active client connection request exists', () => {
      const { org } = workingData
      const subsystemName = uniqueSubsystemName()

      createSubsystemAndOASService(org, subsystemName, (service: any) => {
        createConnection(org, service.subsystem.clientId, service.name, () => {
          cy.setQueryString({ force: false })
          cy.callAPI(
            `ds/api/sdx/v1/organizations/${org.name}/subsystems/${service.subsystem.name}`,
            'DELETE',
            false
          ).then(({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(422)
            expect(body.message).to.be.equal(
              'Subsystem cannot be deleted because it has active connection requests as a client'
            )
          })
        })
      })
    })

    it('DELETE /organizations/{org}/subsystems/{name} - active provider connection request exists', () => {
      const { org } = workingData
      const clientSubsystemName = uniqueSubsystemName()
      const providerSubsystemName = uniqueSubsystemName()

      createSubsystem(org, clientSubsystemName, () => {
        createSubsystemAndOASService(org, providerSubsystemName, (service: any) => {
          createConnection(
            org,
            clientIdForSubsystem(org, clientSubsystemName),
            service.name,
            () => {
              cy.setQueryString({ force: false })
              cy.callAPI(
                `ds/api/sdx/v1/organizations/${org.name}/subsystems/${providerSubsystemName}`,
                'DELETE',
                false
              ).then(({ apiRes: { status, body } }: any) => {
                expect(status).to.be.equal(422)
                expect(body.message).to.be.equal(
                  'Subsystem cannot be deleted because it has active connection requests as a service provider'
                )
              })
            }
          )
        })
      })
    })

    it('DELETE /organizations/{org}/subsystems/{name} - gateway configuration exists', () => {
      const { org } = workingData
      const subsystemName = uniqueSubsystemName()
      const runtimeGroupName = `rg${Cypress._.random(100000, 999999)}`

      createSubsystem(org, subsystemName, () => {
        createRuntimeGroup(
          org,
          runtimeGroupName,
          `http://internal.${runtimeGroupName}.servers.sdx`
        )

        cy.setRequestBody({
          runtimeGroupName,
        })
        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystemName}/gateway`,
          'PUT'
        ).then(({ apiRes: { status, body } }: any) => {
          expect(status, body.message).to.be.equal(200)
          expect(body).to.have.property('gatewayId')

          cy.setQueryString({ force: false })
          cy.callAPI(
            `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystemName}`,
            'DELETE',
            false
          ).then(({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(422)
            expect(body.message).to.be.equal(
              'Subsystem cannot be deleted because gateway configuration exists'
            )
          })
        })
      })
    })

    it('GET /organizations/{org}/clients (incomplete setup)', () => {
      const { org } = workingData
      const subsystemName = uniqueSubsystemName()

      createSubsystem(org, subsystemName, () => {
        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/clients/${subsystemName}`,
          'GET'
        ).then(({ apiRes: { body } }: any) => {
          expect(body.message).to.be.equal('Incomplete subsystem setup')
          expect(body.fields['inputs.service_locator'].message).to.be.equal(
            'missing gateway details'
          )
        })
      })
    })
  })
})
