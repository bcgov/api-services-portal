import { new_service } from '../../../support/sdx-commands'

function createConnection(org: any, service: any, isApproved: boolean, next: any) {
  // Creates a ConnectionRequest through the public SDX API so the test data
  // follows the same path as a real client/service connection request.
  const clientId = service.subsystem.clientId
  const serviceId = service.name
  const payload: any = {
    clientId: `${clientId}`,
    serviceId: `${serviceId}`,
    policyVersion: 'SDX.R0.00',
    environment: 'dev',
    isActive: false,
    requesterDetails: {
      requester: {
        name: 'somebody',
      },
      client: {
        clientId: 'client-x',
      },
    },
  }

  cy.setRequestBody(payload)
  cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'PUT').then(
    ({ apiRes: { status, body } }: any) => {
      expect(status).to.be.equal(200)
      expect(body.result).to.be.equal('created')
      expect(typeof body.id).to.be.equal('string')

      cy.setRequestBody({
        clientId: `${clientId}`,
        serviceId: `${serviceId}`,
        isApproved: isApproved,
      })
      cy.callAPI(
        `ds/api/sdx/v1/organizations/${org.name}/connections/approval`,
        'PUT'
      ).then(({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)

        next(body.id)
      })
    }
  )
}

function createTaggedKongService(tag: string) {
  // Creates minimal Kong gateway configuration with the supplied tag.
  // DELETE validation uses Kong's /tags/{tag} endpoint, so a tagged service
  // is enough to simulate existing gateway configuration for that connection.
  const name = `conn-delete-${Date.now()}-${Math.floor(Math.random() * 100000)}`

  cy.request({
    method: 'POST',
    url: `${Cypress.env('KONG_CONFIG_URL')}/services`,
    body: {
      name,
      host: 'httpbun.com',
      port: 443,
      protocol: 'https',
      tags: [tag],
    },
    failOnStatusCode: false,
  }).then((res) => {
    expect(res.status).to.be.oneOf([200, 201])
  })
}

describe('SDX Connection Requests (Sad Deletions)', () => {
  let workingData: any
  let diffOrg: any

  beforeEach(() => {
    cy.fixture('toys.v1.yaml', null).as('toys.v1')

    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
      cy.buildOrgGatewayDatasetAndProduct().then((data) => {
        diffOrg = data
      })
    })
  })

  // it('DELETE /organizations/{org}/connections/{id} - client gateway configuration exists', () => {
  //   const { org, datasetId } = workingData

  //   new_service(org, `SUBSYS-${datasetId.toUpperCase()}`, (service: any) => {
  //     createConnection(org, service, true, (connectionId: string) => {
  //       const clientTag = `ns.${service.subsystem.gateway.id}.${connectionId}.c`

  //       createTaggedKongService(clientTag)

  //       cy.callAPI(
  //         `ds/api/sdx/v1/organizations/${org.name}/connections/${connectionId}`,
  //         'DELETE'
  //       ).then(({ apiRes: { status, body } }: any) => {
  //         expect(status).to.be.equal(400)
  //         expect(JSON.stringify(body)).to.include(
  //           `client gateway configuration still exists for tag ${clientTag}`
  //         )
  //       })
  //     })
  //   })
  // })

  // it('DELETE /organizations/{org}/connections/{id} - service gateway configuration exists', () => {
  //   const { org, datasetId } = workingData

  //   new_service(org, `SUBSYS-${datasetId.toUpperCase()}`, (service: any) => {
  //     createConnection(org, service, true, (connectionId: string) => {
  //       const serviceTag = `ns.${service.subsystem.gateway.id}.${connectionId}.p`

  //       createTaggedKongService(serviceTag)

  //       cy.callAPI(
  //         `ds/api/sdx/v1/organizations/${org.name}/connections/${connectionId}`,
  //         'DELETE'
  //       ).then(({ apiRes: { status, body } }: any) => {
  //         expect(status).to.be.equal(422)
  //         expect(JSON.stringify(body)).to.include(
  //           `service gateway configuration still exists for tag ${serviceTag}`
  //         )
  //       })
  //     })
  //   })
  // })

  // it('DELETE /organizations/{org}/connections/{id} - client and service gateway configuration exists', () => {
  //   const { org, datasetId } = workingData

  //   new_service(org, `SUBSYS-${datasetId.toUpperCase()}`, (service: any) => {
  //     createConnection(org, service, true, (connectionId: string) => {
  //       const clientTag = `ns.${service.subsystem.gateway.id}.${connectionId}.c`
  //       const serviceTag = `ns.${service.subsystem.gateway.id}.${connectionId}.p`

  //       createTaggedKongService(clientTag)
  //       createTaggedKongService(serviceTag)

  //       cy.callAPI(
  //         `ds/api/sdx/v1/organizations/${org.name}/connections/${connectionId}`,
  //         'DELETE'
  //       ).then(({ apiRes: { status, body } }: any) => {
  //         expect(status).to.be.equal(422)
  //         expect(JSON.stringify(body)).to.include(
  //           `client gateway configuration still exists for tag ${clientTag}`
  //         )
  //         expect(JSON.stringify(body)).to.include(
  //           `service gateway configuration still exists for tag ${serviceTag}`
  //         )
  //       })
  //     })
  //   })
  // })

  it('DELETE /organizations/{org}/connections/{id} - org mismatch', () => {
    const { org, datasetId } = workingData

    new_service(org, `SUBSYS-${datasetId.toUpperCase()}`, (service: any) => {
      createConnection(org, service, true, (connectionId: string) => {
        cy.callAPI(
          `ds/api/sdx/v1/organizations/${diffOrg.org.name}/connections/${connectionId}`,
          'DELETE'
        ).then(({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(422)
          expect(body.message).to.be.equal('Validation Failed')
          expect(body.fields.organization.message).to.be.equal(
            'Not authorized to access this connection request'
          )
        })
      })
    })
  })

  it('DELETE /organizations/{org}/connections/{id} - connection not found', () => {
    const { org } = workingData

    cy.callAPI(
      `ds/api/sdx/v1/organizations/${org.name}/connections/does-not-exist`,
      'DELETE'
    ).then(({ apiRes: { status, body } }: any) => {
      expect(status).to.be.equal(500)
      expect(body.message).to.be.equal('Internal Server Error')
    })
  })

  // it('DELETE /organizations/{org}/connections/{id} - unapproved connection with gateway configuration exists', () => {
  //   const { org, datasetId } = workingData

  //   new_service(org, `SUBSYS-${datasetId.toUpperCase()}`, (service: any) => {
  //     createConnection(org, service, false, (connectionId: string) => {
  //       const clientTag = `ns.${service.subsystem.gateway.id}.${connectionId}.c`

  //       createTaggedKongService(clientTag)

  //       cy.callAPI(
  //         `ds/api/sdx/v1/organizations/${org.name}/connections/${connectionId}`,
  //         'DELETE'
  //       ).then(({ apiRes: { status, body } }: any) => {
  //         expect(status).to.be.equal(422)
  //         expect(JSON.stringify(body)).to.include(
  //           `client gateway configuration still exists for tag ${clientTag}`
  //         )
  //       })
  //     })
  //   })
  // })
})
