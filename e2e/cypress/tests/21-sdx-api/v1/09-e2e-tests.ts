import { v4 as uuidv4 } from 'uuid'

import {
  applyFixtureEdgeSigningKey,
  applyServicePattern,
  createJanisOrgAndAccess,
  createRuntimeGroup,
  createSubsystemAndOASService,
  createSubsystemGateway,
  uniqueSubsystemName,
  updateRuntimeGroupAddHostedOrg,
  updateSubsystemIntegrationClients,
} from '../../../support/sdx-commands'

describe('SDX E2E Tests', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data

      const rg = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 6)
      workingData['runtimeGroupId'] = rg.toLowerCase()

      workingData['env'] = 'dev'

      return createJanisOrgAndAccess().then(() => {
        return createRuntimeGroup(
          { name: 'user-janis' },
          'rg0',
          workingData.env,
          'http://kong-sdx-edge0.localtest.me:9080',
          'https://kong-sdx-edge0.localtest.me:9443'
        ).then(() => {
          return applyFixtureEdgeSigningKey('user-janis', 'rg0', workingData.env).then(
            () => {
              // docker compose spins up one runtime group "rg0"
              // but for this org to use the "rg0" runtime group, we need to add the org to the hostedOrganizations list for rg0
              return updateRuntimeGroupAddHostedOrg(
                { name: 'user-janis' },
                'rg0',
                workingData.env,
                workingData.org.name
              )
            }
          )
        })
      })
    })
  })

  describe('Basic connection', () => {
    it('PUT /organizations/{org}/connections', () => {
      const { org, datasetId, env } = workingData
      const subsystemName = uniqueSubsystemName()
      const integrationClientId = `client-${datasetId}-${uuidv4()
        .replace(/-/g, '')
        .substring(0, 8)}`

      // create a new subsystem and publish a new OAS Service in dev
      createSubsystemAndOASService(
        org,
        subsystemName,
        env,
        (service: any) => {
          const clientId = service.subsystem.clientId
          const serviceId = service.name

          // register the subsystem on the "rg0" runtime group
          createSubsystemGateway(org, 'rg0', service.subsystem.name, () => {
            updateSubsystemIntegrationClients(
              org,
              service.subsystem.name,
              [integrationClientId],
              () => {
                // now create a connection between the subsystem and the service
                // using policy SDX.R0.00, which is a simple point-to-point connection with no upgrades

                // Not including `verify: {}` because getting the public key created is a bit tricky

                const connection = {
                  clientId: `${clientId}`,
                  serviceId: `${serviceId}`,
                  policyVersion: 'SDX.R0.00',
                  environment: env,
                  isApproved: false,
                  isActive: true,
                  requesterDetails: {
                    requester: {
                      name: 'Janis',
                    },
                    client: {
                      clientId: integrationClientId,
                    },
                  },
                  clientResources: {
                    gatewayPatterns: {
                      'sdx-p2p-consumer.r1': {
                        stripPath: false,
                        upgrades: {
                          sign: {
                            alg: 'RS256',
                          },
                        },
                      },
                      'sdx-p2p-consumer-access.r1': {},
                    },
                  },
                  serviceResources: {
                    gatewayPatterns: {
                      'sdx-p2p-provider.r1': {
                        upstreamUrl: 'http://upstream-mock-api.localtest.me:2025',
                        upgrades: {
                          sign: {
                            alg: 'RS256',
                          },
                        },
                      },
                    },
                  },
                }
                cy.setRequestBody(connection)
                cy.callAPI(
                  `ds/api/sdx/v1/organizations/${org.name}/connections`,
                  'PUT'
                ).then(({ apiRes: { status, body } }: any) => {
                  expect(status).to.be.equal(200)
                  expect(body.result).to.be.equal('created')
                  expect(typeof body.id).to.be.equal('string')

                  cy.setRequestBody({
                    clientId: `${clientId}`,
                    serviceId: `${serviceId}`,
                    isApproved: true,
                  })

                  cy.callAPI(
                    `ds/api/sdx/v1/organizations/${org.name}/connections/approval`,
                    'PUT'
                  ).then(({ apiRes: { status, body } }: any) => {
                    expect(status).to.be.equal(200)
                    expect(body.result).to.be.equal('updated')
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
                      expect(body).has.property('headers')
                      expect(body.headers).has.property('x-edge-token')
                    })
                    // disable access
                    cy.setRequestBody({
                      clientId: `${clientId}`,
                      serviceId: `${serviceId}`,
                      isActive: false,
                    })
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
                  })
                })
              }
            )
          })
        }
      )
    })
  })

  describe('Subsystem API', () => {
    it('DELETE /organizations/{org}/subsystems/{name} - gateway configuration exists', () => {
      const { org, env, datasetId } = workingData
      const subsystemName = uniqueSubsystemName()

      createSubsystemAndOASService(org, subsystemName, env, (service: any) => {
        const serviceId = service.name

        createSubsystemGateway(org, 'rg0', subsystemName, () => {
          applyServicePattern(org.name, serviceId, env, 'apply').then(
            ({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(200)
              // expect(JSON.stringify(body)).to.be.equal('applied')

              // just have to wait because it takes a bit of time to propogate the changes
              cy.wait(10000)

              cy.setQueryString({})
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
            }
          )
        })
      })
    })
  })
})
