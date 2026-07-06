import { v4 as uuidv4 } from 'uuid'
import {
  createJanisOrgAndAccess,
  updateRuntimeGroupAddHostedOrg,
  createRuntimeGroup,
} from '../../../support/sdx-commands'

describe('SDX Organization Signing', () => {
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
        )
      })
    })
  })

  describe('Runtime Group Happy Paths', () => {
    it('PUT /organizations/{org}/runtime-groups', () => {
      const { org, gateway, dataset, runtimeGroupId, product } = workingData
      const runtimeGroupName = 'rg0'

      updateRuntimeGroupAddHostedOrg(
        { name: 'user-janis' },
        'rg0',
        'dev',
        workingData.org.name
      ).then(() => {
        // call the /keys endpoint to get a CSR
        cy.setRequestBody({
          runtimeGroupName: runtimeGroupName,
          environment: 'dev',
        })
        cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/keys`, 'POST').then(
          ({ apiRes: { status, body, headers } }: any) => {
            expect(status).to.be.equal(200)
            expect(headers['content-type']).to.be.equal('text/plain; charset=utf-8')
            expect(body).to.include('-----BEGIN CERTIFICATE REQUEST-----')
            expect(body).to.include('-----END CERTIFICATE REQUEST-----')

            cy.callAPI(
              `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
              'GET'
            ).then(({ apiRes: { status, body: activities } }: any) => {
              expect(status).to.be.equal(200)
              const entry = activities.find(
                (a: any) =>
                  a.params?.entity === 'OrganizationCertificate' &&
                  a.params?.runtimeGroupName === runtimeGroupName
              )
              expect(entry?.params?.entity).to.equal('OrganizationCertificate')
              expect(entry?.params?.runtimeGroupName).to.equal(runtimeGroupName)
              expect(entry?.result).to.equal('success')
            })
          }
        )
      })
    })
  })

  describe('Runtime Group Sad Paths', () => {
    it('PUT /organizations/{org}/runtime-groups (invalid runtime group)', () => {
      const { org, gateway, dataset, runtimeGroupId, product } = workingData

      // call the /keys endpoint to get a CSR
      cy.setRequestBody({
        runtimeGroupName: 'BLAH',
        environment: 'cyp',
      })
      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/keys`, 'POST').then(
        ({ apiRes: { status, body, headers } }: any) => {
          expect(status).to.be.equal(500)
          expect(body.message).to.include('[400]')
          // expect(body.fields.environment.message).to.be.equal(
          //   'Runtime Group not found for the specified environment'
          // )
        }
      )
    })
  })
})
