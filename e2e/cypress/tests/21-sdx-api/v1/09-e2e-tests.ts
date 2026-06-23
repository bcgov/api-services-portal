import { v4 as uuidv4 } from 'uuid'

import {
  createSubsystemAndOASService,
  createSubsystemGateway,
  updateRuntimeGroupAddHostedOrg,
} from '../../../support/sdx-commands'

describe('SDX E2E Tests', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data

      const rg = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 6)
      workingData['runtimeGroupId'] = rg.toLowerCase()

      // docker compose spins up one runtime group "rg0"
      // but for this org to use the "rg0" runtime group, we need to add the org to the hostedOrganizations list for rg0
      updateRuntimeGroupAddHostedOrg(
        { name: 'user-janis' },
        'rg0',
        'dev',
        workingData.org.name
      )
    })
  })

  describe('Basic connection', () => {
    it('PUT /organizations/{org}/connections', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      // create a new subsystem and publish a new OAS Service in dev
      createSubsystemAndOASService(
        org,
        `SUBSYS-${datasetId.toUpperCase()}`,
        'dev',
        (service: any) => {
          const clientId = service.subsystem.clientId
          const serviceId = service.name

          // register the subsystem on the "rg0" runtime group
          createSubsystemGateway(org, 'rg0', service.subsystem.name, () => {
            // now create a connection between the subsystem and the service
            // using policy SDX.R0.00, which is a simple point-to-point connection with no upgrades
            const connection = {
              clientId: `${clientId}`,
              serviceId: `${serviceId}`,
              policyVersion: 'SDX.R0.00',
              environment: 'dev',
              isApproved: true,
              requesterDetails: {
                requester: 'Janis',
                client: {
                  clientId: 'client-a',
                },
                service: {
                  clientId: 'service-a',
                },
              },
              clientResources: {
                gatewayPatterns: {
                  'sdx-p2p-consumer.r1': {
                    stripPath: false,
                    upgrades: {},
                  },
                },
              },
              serviceResources: {
                gatewayPatterns: {
                  'sdx-p2p-provider.r1': {
                    upstreamUrl: 'http://upstream-mock-api.localtest.me:2025',
                    upgrades: {},
                  },
                },
              },
            }
            cy.setRequestBody(connection)
            cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'PUT').then(
              ({ apiRes: { status, body } }: any) => {
                expect(status).to.be.equal(200)
                expect(body.result).to.be.equal('created')
                expect(typeof body.id).to.be.equal('string')

                // connection is approved; the provisioner runs asynchronously
                // and kong control plane also pushes out changes to the data planes
                // async, so do some retries until we get a good response
                let retries = 0
                while (retries < 8) {
                  retries++
                  cy.makeSDXCall({
                    method: 'GET',
                    path: `/sdx/0/${serviceId}/ping`,
                  }).then(({ status, body }) => {
                    if (status == 200) {
                      expect(status).to.be.equal(200)
                      expect(body).has.property('currentTime')
                      retries = 100
                    } else {
                      cy.wait(2000)
                    }
                  })
                }
                expect(retries).to.be.lessThan(
                  100,
                  'SDX call did not succeed after 8 retries'
                )
              }
            )
          })
        }
      )
    })
  })
})
