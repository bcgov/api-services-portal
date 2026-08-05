import { v4 as uuidv4 } from 'uuid'

import {
  createRuntimeGroup,
  createSubsystem,
  createSubsystemGateway,
  uniqueSubsystemName,
} from '../../support/sdx-commands'

describe('SP136 - Subsystem RBAC access', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data

      const rg = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 6)
      workingData['runtimeGroupId'] = rg.toLowerCase()
      workingData['env'] = 'dev'
    })
  })

  it('GET /organizations/{org}/subsystems/{name}/access - returns the roles granted when the gateway was registered', () => {
    const { org, runtimeGroupId, env } = workingData
    const subsystemName = uniqueSubsystemName()

    createSubsystem(org, subsystemName, () => {
      createRuntimeGroup(org, runtimeGroupId, env)

      createSubsystemGateway(org, runtimeGroupId, subsystemName, () => {
        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystemName}/access`,
          'GET'
        ).then(({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.name).to.be.equal(subsystemName)
          expect(body.parent).to.be.equal('/systems')
          expect(body.members).to.be.an('array')

          // registering the gateway grants the acting user all three
          // subsystem roles as a side effect - confirm that is visible here
          const creator = body.members.find((m: any) =>
            ['system-owner', 'tech-lead', 'access-manager'].every((role) =>
              m.roles.includes(role)
            )
          )
          expect(
            creator,
            'expected the user who registered the gateway to hold all three subsystem roles'
          ).to.exist

          workingData['subsystemName'] = subsystemName
        })
      })
    })
  })

  it('PUT /organizations/{org}/subsystems/{name}/access - changes subsystem RBAC membership', () => {
    const { org, subsystemName } = workingData

    cy.setRequestBody({
      members: [
        {
          member: { email: 'mark@gmail.com' },
          roles: ['tech-lead'],
        },
      ],
    })
    cy.callAPI(
      `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystemName}/access`,
      'PUT'
    ).then(({ apiRes: { status } }: any) => {
      expect(status).to.be.equal(204)

      cy.callAPI(
        `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystemName}/access`,
        'GET'
      ).then(({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)

        const match = {
          name: subsystemName,
          parent: '/systems',
          members: [
            {
              member: {
                username: 'mark@idir',
                email: 'mark@gmail.com',
                name: 'mark@idir',
              },
              roles: ['tech-lead'],
            },
          ],
        }
        // ignore the ID as it will always be different
        body.members.forEach((m: any) => {
          delete m.member.id
        })
        expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))
      })
    })
  })
})
