import { v4 as uuidv4 } from 'uuid'

describe('SDX Organization Signing', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data

      const rg = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 6)
      workingData['runtimeGroupId'] = rg.toLowerCase()
    })
  })

  describe('Runtime Group Happy Paths', () => {
    it('PUT /organizations/{org}/runtime-groups', () => {
      const { org, gateway, dataset, runtimeGroupId, product } = workingData

      const payload = {
        name: `${runtimeGroupId}`,
        hostedOrganizations: [org.name],
      }
      cy.setRequestBody(payload)
      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/runtime-groups`, 'PUT').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)

          // call the /keys endpoint to get a CSR
          cy.setRequestBody({
            runtimeGroupName: payload.name,
          })
          cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/keys`, 'POST').then(
            ({ apiRes: { status, body, headers } }: any) => {
              expect(status).to.be.equal(200)
              expect(headers['content-type']).to.be.equal('text/plain; charset=utf-8')
              expect(body).to.include('-----BEGIN CERTIFICATE REQUEST-----')
              expect(body).to.include('-----END CERTIFICATE REQUEST-----')
            }
          )
        }
      )
    })
  })
})
