import {
  createSubsystemGateway,
  new_service,
  updateRuntimeGroupAddHostedOrg,
} from '../../../support/sdx-commands'

describe('SDX Connection Requests (Happy Paths)', () => {
  let workingData: any

  beforeEach(() => {
    cy.fixture('toys.v1.yaml', null).as('toys.v1')

    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  // it('GET /organizations/{org}/connections', () => {
  //   const { org, gateway, dataset, datasetId, product } = workingData

  //   cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'GET').then(
  //     ({ apiRes: { status, body } }: any) => {
  //       expect(status).to.be.equal(200)
  //       expect(body.length).to.be.equal(0)
  //     }
  //   )
  // })

  // it('PUT /organizations/{org}/connections - New', () => {
  //   const { org, gateway, dataset, datasetId, product } = workingData

  //   new_service(org, `SUBSYS-${datasetId.toUpperCase()}`, (service: any) => {
  //     const clientId = service.subsystem.clientId
  //     const serviceId = service.name
  //     const payload = {
  //       clientId: `${clientId}`,
  //       serviceId: `${serviceId}`,
  //       policyVersion: 'SDX.R0.00',
  //       environment: 'lab',
  //     }
  //     cy.setRequestBody(payload)
  //     cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'PUT').then(
  //       ({ apiRes: { status, body } }: any) => {
  //         expect(status).to.be.equal(200)
  //         expect(body.result).to.be.equal('created')
  //         expect(typeof body.id).to.be.equal('string')
  //       }
  //     )
  //   })
  // })

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
          policyVersion: 'SDX.R0.00',
          environment: 'dev',
        }
        // first expect no changes
        cy.setRequestBody(payload)
        cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'PUT').then(
          ({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)
            expect(body.result).to.be.equal('created')
            expect(typeof body.id).to.be.equal('string')

            const payload: any = {
              clientId: `${clientId}`,
              serviceId: `${serviceId}`,
            }

            cy.setRequestBody(payload)
            cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'PUT').then(
              ({ apiRes: { status, body } }: any) => {
                expect(status).to.be.equal(200)
                expect(body.result).to.be.equal('no-change')
                expect(typeof body.id).to.be.equal('string')

                // then mark it approved and expect an updated record
                const payload: any = {
                  clientId: `${clientId}`,
                  serviceId: `${serviceId}`,
                  isApproved: true,
                }

                cy.setRequestBody(payload)
                cy.callAPI(
                  `ds/api/sdx/v1/organizations/${org.name}/connections/approval`,
                  'PUT'
                ).then(({ apiRes: { status, body } }: any) => {
                  expect(status).to.be.equal(200)
                  expect(body.result).to.be.equal('updated')
                  expect(typeof body.id).to.be.equal('string')
                })
              }
            )
          }
        )
      })
    })
  })
})
