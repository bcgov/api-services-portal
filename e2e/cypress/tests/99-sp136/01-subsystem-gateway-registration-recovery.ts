import { v4 as uuidv4 } from 'uuid'

import { createRuntimeGroup, createSubsystem, uniqueSubsystemName } from '../../support/sdx-commands'

describe('SDX Subsystem Gateway Registration Recovery', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data

      const rg = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 6)
      workingData['runtimeGroupId'] = rg.toLowerCase()

      createRuntimeGroup(workingData.org, workingData.runtimeGroupId, 'dev')
    })
  })

  it('PUT /organizations/{org}/subsystems/{name}/gateway - retrying a registration for the same subsystem recovers instead of failing', () => {
    const { org, runtimeGroupId } = workingData
    const subsystemName = uniqueSubsystemName()

    createSubsystem(org, subsystemName, () => {
      cy.setRequestBody({ runtimeGroupName: runtimeGroupId })
      cy.callAPI(
        `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystemName}/gateway`,
        'PUT'
      ).then(({ apiRes: { status, body } }: any) => {
        expect(status, body.message).to.be.equal(200)
        expect(body).to.have.property('gatewayId')
        const gatewayId = body.gatewayId

        // Simulate a caller retrying the same registration request - e.g.
        // because it never saw the first response (timeout, dropped
        // connection, portal restart). The subsystem's gateway/namespace ID
        // is fixed and immutable, so this always targets the exact same
        // namespace as the first call.
        cy.setRequestBody({ runtimeGroupName: runtimeGroupId })
        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystemName}/gateway`,
          'PUT'
        ).then(({ apiRes: { status, body } }: any) => {
          expect(status, body.message).to.be.equal(200)
          expect(body).to.have.property('gatewayId')
          expect(body.gatewayId).to.be.equal(gatewayId)

          // The subsystem catalog should reflect a single, consistent
          // registration - no duplicate/corrupted state left behind by the
          // repeated registration attempt.
          cy.callAPI(
            `ds/api/sdx/v1/organizations/${org.name}/subsystems`,
            'GET'
          ).then(({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)
            const matches = body.filter((s: any) => s.name === subsystemName)
            expect(matches.length).to.be.equal(1)
            expect(matches[0].gatewayId).to.be.equal(gatewayId)
          })
        })
      })
    })
  })
})
