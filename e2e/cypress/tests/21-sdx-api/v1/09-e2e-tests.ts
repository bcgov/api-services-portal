import { v4 as uuidv4 } from 'uuid'

import ConsumersPage from '../../../pageObjects/consumers'

import {
  applyFixtureEdgeSigningKey,
  applyServicePattern,
  applySubsystemPattern,
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
    const consumers = new ConsumersPage()
    let conn: any

    it('PUT /organizations/{org}/connections', () => {
      const { org, datasetId, env } = workingData
      const subsystemName = uniqueSubsystemName()
      const integrationId = uuidv4().replace(/-/g, '').substring(0, 8)
      const integrationClientId = `client-${datasetId}-${integrationId}`

      // create a new subsystem and publish a new OAS Service in dev
      createSubsystemAndOASService(org, subsystemName, env, (service: any) => {
        const clientId = service.subsystem.clientId
        const serviceId = service.name

        // register the subsystem on the "rg0" runtime group
        createSubsystemGateway(
          org,
          'rg0',
          service.subsystem.name,
          ({ gatewayId }: any) => {
            conn = {
              clientId,
              serviceId,
              gatewayId,
              integrationClientId,
              productName: service.subsystem.name,
            }

            // the subsystem is both client and provider here, so this creates
            // the Application and Product the connection's ServiceAccess links
            applySubsystemPattern(org.name, clientId).then(
              ({ apiRes: { status, body } }: any) => {
                expect(status, JSON.stringify(body)).to.be.equal(200)
              }
            )

            updateSubsystemIntegrationClients(
              org,
              service.subsystem.name,
              [integrationId],
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
                      integrationId: integrationId,
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
                    cy.setHeader('X-Client-Id', clientId)
                    cy.makeSDXCall({
                      method: 'GET',
                      path: `/sdx/0/${serviceId}/ping`,
                    }).then(({ status, body }) => {
                      expect(status).to.be.equal(200)
                      expect(body).has.property('currentTime')
                      expect(body).has.property('headers')
                      expect(body.headers).has.property('x-edge-token')
                    })
                  })
                })
              }
            )
          }
        )
      })
    })

    it('lists the integration client on the gateway Consumers page', () => {
      cy.visit('/')
      // Janis registered the subsystem gateway, so she only has the subsystem
      // roles on it, which give read-only (sdx-viewer) access to its consumers
      cy.login(Cypress.env('DEV_USERNAME'), Cypress.env('DEV_PASSWORD'))
      cy.activateGateway(conn.gatewayId)
      cy.visit(consumers.path)
      cy.get(consumers.allConsumerTable, { timeout: 15000 }).should(
        'contain',
        conn.integrationClientId
      )
      cy.get(`[data-testid^="consumer-"][data-testid$="-menu"]`).should('not.exist')

      // the consumer details list the subsystem's Product
      cy.contains('a', conn.integrationClientId).click()
      cy.contains('Products (1)', { timeout: 15000 })
      cy.contains(conn.productName).should('be.visible')
      cy.get(consumers.productDetails).should('have.length', 1)
      cy.get(consumers.consumerGrantAccessBtn).should('not.exist')
    })

    it('PUT /organizations/{org}/connections - deactivate', () => {
      const { org } = workingData
      const { clientId, serviceId } = conn

      // disable access
      cy.setRequestBody({
        clientId: `${clientId}`,
        serviceId: `${serviceId}`,
        isActive: false,
      })
      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'PUT').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.result).to.be.equal('updated')
          expect(typeof body.id).to.be.equal('string')

          cy.wait(10000)

          // connection is de-activated; the provisioner runs asynchronously
          // and kong control plane also pushes out changes to the data planes
          // async, so do some retries until we get a good response
          cy.setHeader('X-Client-Id', clientId)
          cy.makeSDXCall({
            method: 'GET',
            path: `/sdx/0/${serviceId}/ping`,
          }).then(({ status, body }) => {
            // expect 401 or 404, depending on runtime group default routes
            expect([401, 404]).to.include(status)
          })
        }
      )
    })

    it('removes the integration client from the gateway Consumers page', () => {
      // the page shows "0 Consumers" while it loads, so check the list it fetches
      cy.intercept('POST', '**/gql/api', (req) => {
        if (req.body?.query?.includes('getFilteredNamespaceConsumers')) {
          req.alias = 'getConsumers'
        }
      })
      cy.visit(consumers.path)
      cy.wait('@getConsumers')
        .its('response.body.data.getFilteredNamespaceConsumers')
        .then((list: any[]) => {
          expect(list.map((c) => c.username)).not.to.include(conn.integrationClientId)
        })
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
