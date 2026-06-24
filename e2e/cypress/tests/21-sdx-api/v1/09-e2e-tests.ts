import { v4 as uuidv4 } from 'uuid'

import {
  createJanisOrgAndAccess,
  createRuntimeGroup,
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

      return createJanisOrgAndAccess().then(() => {
        return createRuntimeGroup(
          { name: 'user-janis' },
          'rg0',
          'dev',
          'http://kong-sdx-edge0.localtest.me:9080',
          'https://kong-sdx-edge0.localtest.me:9443'
        ).then(() => {
          // docker compose spins up one runtime group "rg0"
          // but for this org to use the "rg0" runtime group, we need to add the org to the hostedOrganizations list for rg0
          return updateRuntimeGroupAddHostedOrg(
            { name: 'user-janis' },
            'rg0',
            'dev',
            workingData.org.name
          )
        })
      })
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
              isActive: true,
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

                cy.wait(10000)

                // connection is approved; the provisioner runs asynchronously
                // and kong control plane also pushes out changes to the data planes
                // async, so do some retries until we get a good response
                cy.makeSDXCall({
                  method: 'GET',
                  path: `/sdx/0/${serviceId}/ping`,
                }).then(({ status, body }) => {
                  expect(status).to.be.equal(200)
                  expect(body).has.property('currentTime')
                })
                // revoke access
                connection.isActive = false

                cy.setRequestBody(connection)
                cy.callAPI(
                  `ds/api/sdx/v1/organizations/${org.name}/connections`,
                  'PUT'
                ).then(({ apiRes: { status, body } }: any) => {
                  expect(status).to.be.equal(200)
                  expect(body.result).to.be.equal('updated')
                  expect(typeof body.id).to.be.equal('string')

                  cy.wait(10000)

                  // connection is de-activated; the provisioner runs asynchronously
                  // and kong control plane also pushes out changes to the data planes
                  // async, so do some retries until we get a good response
                  cy.makeSDXCall({
                    method: 'GET',
                    path: `/sdx/0/${serviceId}/ping`,
                  }).then(({ status, body }) => {
                    // expect 401 or 404, depending on runtime group default routes
                    expect([401, 404]).to.include(status)
                  })
                })
              }
            )
          })
        }
      )
    })
  })
})
