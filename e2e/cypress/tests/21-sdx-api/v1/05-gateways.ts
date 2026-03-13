import { v4 as uuidv4 } from 'uuid'

describe('SDX Gateways', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data

      const rg = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 6)
      workingData['runtimeGroupId'] = rg.toLowerCase()
    })
  })

  describe('Happy Paths', () => {
    describe('Register Organization Gateway', () => {
      it('PUT /organizations/{org}/gateway', () => {
        const { org, gateway, dataset, runtimeGroupId, product } = workingData

        const memberClass = org.tags[0].split(':')[1]
        const memberId = org.tags[1].split(':')[1]
        const expectedGatewayId = `sdx-o-${memberClass}-${memberId}`.toLowerCase()

        cy.setRequestBody({})
        cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/gateway`, 'PUT').then(
          ({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)
            expect(body.gatewayId).to.be.equal(expectedGatewayId)
          }
        )
      })
    })

    describe('Register Runtime Group Gateway', () => {
      it('PUT /organizations/{org}/runtime-groups/{rg}/gateway', () => {
        const { org, gateway, dataset, runtimeGroupId, product } = workingData

        const runtimeGroup = {
          name: `${runtimeGroupId}1`,
          hostedOrganizations: [org.name],
        }
        cy.setRequestBody(runtimeGroup)
        cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/runtime-groups`, 'PUT').then(
          ({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)

            cy.callAPI(
              `ds/api/sdx/v1/organizations/${org.name}/runtime-groups?filter=owned`,
              'GET'
            ).then(({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(200)
              expect(body.length).to.be.equal(1)
              expect(body[0].host).to.be.equal(`${runtimeGroup.name}.servers.sdx`)
              expect(body[0].name).to.be.equal(`${runtimeGroup.name}`)
              expect(body[0]).to.have.property('gatewayId')
              expect(body[0].organization).to.be.equal(org.name)

              const gatewayId = body[0].gatewayId

              cy.clearRequestBody()
              cy.callAPI(
                `ds/api/sdx/v1/organizations/${org.name}/runtime-groups/${runtimeGroup.name}/gateway`,
                'PUT'
              ).then(({ apiRes: { status, body } }: any) => {
                expect(status).to.be.equal(200)
                expect(body).to.have.property('gatewayId')
                expect(body.gatewayId).to.be.equal(gatewayId)
              })
            })
          }
        )
      })
    })

    describe('Register Subsystem Gateway', () => {
      it('PUT /organizations/{org}/subsystems/{subsystem}/gateway', () => {
        const { org, gateway, dataset, datasetId, runtimeGroupId, product } = workingData

        const subsystem = {
          name: `SUBSYS-${datasetId.toUpperCase()}`,
        }
        cy.setRequestBody(subsystem)
        cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/subsystems`, 'PUT').then(
          ({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)

            const runtimeGroup = {
              name: `${runtimeGroupId}2`,
              hostedOrganizations: [org.name],
              consumerEndpoint: `http://internal.${runtimeGroupId}.servers.sdx`,
            }
            cy.setRequestBody(runtimeGroup)
            cy.callAPI(
              `ds/api/sdx/v1/organizations/${org.name}/runtime-groups`,
              'PUT'
            ).then(({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(200)

              cy.setRequestBody({
                runtimeGroupName: runtimeGroup.name,
              })
              cy.callAPI(
                `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystem.name}/gateway`,
                'PUT'
              ).then(({ apiRes: { status, body } }: any) => {
                expect(status).to.be.equal(200)
                expect(body).to.have.property('gatewayId')

                const gatewayId = body.gatewayId

                cy.callAPI(
                  `ds/api/sdx/v1/organizations/${org.name}/clients/${subsystem.name}`,
                  'GET'
                ).then(({ apiRes: { status, body } }: any) => {
                  expect(body.runtimeGroup.name).to.be.equal(runtimeGroup.name)

                  expect(status).to.be.equal(200)
                  expect(body.name).to.be.equal(`SUBSYS-${datasetId.toUpperCase()}`)
                  // expect(JSON.stringify(body)).to.be.equal('')
                  expect(body).to.have.property('gateway')
                  expect(body.gateway.id).to.be.equal(gatewayId)
                  expect(body.organization.name).to.be.equal(org.name)
                })
              })
            })
          }
        )
      })
    })
  })

  describe('Sad Paths', () => {
    describe('Register Runtime Group Gateway', () => {
      it('PUT /organizations/{org}/runtime-groups/{runtimeGroup}/gateway (reg twice)', () => {
        const { org, gateway, dataset, datasetId, runtimeGroupId, product } = workingData

        const runtimeGroup = {
          name: `${runtimeGroupId}3`,
          hostedOrganizations: [org.name],
        }
        cy.setRequestBody(runtimeGroup)
        cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/runtime-groups`, 'PUT').then(
          ({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)

            cy.clearRequestBody()
            cy.callAPI(
              `ds/api/sdx/v1/organizations/${org.name}/runtime-groups/${runtimeGroup.name}/gateway`,
              'PUT'
            ).then(({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(200)

              cy.callAPI(
                `ds/api/sdx/v1/organizations/${org.name}/runtime-groups/${runtimeGroup.name}/gateway`,
                'PUT'
              ).then(({ apiRes: { status, body } }: any) => {
                expect(status).to.be.equal(422)

                expect(body.message).to.be.equal('Namespace already exists')
              })
            })
          }
        )
      })
    })
    describe('Register Subsystem Gateway', () => {
      it('PUT /organizations/{org}/subsystems/{subsystem}/gateway (invalid rg)', () => {
        const { org, gateway, dataset, datasetId, runtimeGroupId, product } = workingData

        const subsystem = {
          name: `SUBSYS-${datasetId.toUpperCase()}`,
        }
        cy.setRequestBody(subsystem)
        cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/subsystems`, 'PUT').then(
          ({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)

            cy.setRequestBody({
              runtimeGroupName: 'invalid',
            })
            cy.callAPI(
              `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystem.name}/gateway`,
              'PUT'
            ).then(({ apiRes: { status, body } }: any) => {
              expect(body.message).to.be.equal('Runtime Group not found')
            })
          }
        )
      })
      it('PUT /organizations/{org}/subsystems/{subsystem}/gateway (reg twice)', () => {
        const { org, gateway, dataset, datasetId, runtimeGroupId, product } = workingData

        const subsystem = {
          name: `SUBSYS2-${datasetId.toUpperCase()}`,
        }
        cy.setRequestBody(subsystem)
        cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/subsystems`, 'PUT').then(
          ({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)

            cy.setRequestBody({
              runtimeGroupName: `${runtimeGroupId}2`,
            })
            cy.callAPI(
              `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystem.name}/gateway`,
              'PUT'
            ).then(({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(200)

              cy.callAPI(
                `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystem.name}/gateway`,
                'PUT'
              ).then(({ apiRes: { status, body } }: any) => {
                expect(status).to.be.equal(422)
                expect(body.message).to.be.equal('Namespace already exists')
              })
            })
          }
        )
      })
    })
  })
})
