import { v4 as uuidv4 } from 'uuid'
import { registerHostOrganization } from '../../../support/sdx-commands'

describe('SDX Organization Activity', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
      workingData.runtimeGroupId = uuidv4()
        .replace(/-/g, '')
        .toUpperCase()
        .substring(0, 6)
        .toLowerCase()
    })
  })

  describe('Runtime group lifecycle in organization activity', () => {
    let org: any
    let runtimeGroupId: string

    beforeEach(() => {
      org = workingData.org
      runtimeGroupId = workingData.runtimeGroupId
      cy.setQueryString({})
    })

    it('records create on organization activity', () => {
      const runtimeGroupName = `${runtimeGroupId}c`
      cy.setRequestBody({
        name: runtimeGroupName,
        hostedOrganizations: [org.name],
      })
      cy.callAPI(
        `ds/api/sdx/v1/organizations/${org.name}/runtime-groups`,
        'PUT'
      ).then(({ apiRes: { status } }: any) => {
        expect(status).to.be.equal(200)

        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/activity?first=100`,
          'GET'
        ).then(({ apiRes: { status, body: activities } }: any) => {
          expect(status).to.be.equal(200)
          const created = activities.find(
            (a: any) =>
              a.params?.entity === 'RuntimeGroup' &&
              a.params?.action === 'created' &&
              a.params?.runtimeGroupName === runtimeGroupName
          )
          expect(created?.params?.entity).to.equal('RuntimeGroup')
          expect(created?.params?.action).to.equal('created')
          expect(created?.params?.runtimeGroupName).to.equal(runtimeGroupName)
          expect(created?.params?.hostedOrganizations).to.equal(org.name)
          expect(created?.result).to.equal('success')
        })
      })
    })

    it('records hosting update on organization activity', () => {
      const runtimeGroupName = `${runtimeGroupId}u`
      const hostOrgA = `mof-pups-${runtimeGroupId}`
      const hostOrgB = `mof-dogs-${runtimeGroupId}`
      const expectedHostedList = [hostOrgA, hostOrgB].sort().join(', ')

      registerHostOrganization(hostOrgA, 'pups').then(
        ({ apiRes: { status: orgAStatus } }: any) => {
          expect(orgAStatus).to.be.equal(200)

          registerHostOrganization(hostOrgB, 'dogs').then(
            ({ apiRes: { status: orgBStatus } }: any) => {
              expect(orgBStatus).to.be.equal(200)

              cy.setRequestBody({
                name: runtimeGroupName,
                hostedOrganizations: [],
              })
              cy.callAPI(
                `ds/api/sdx/v1/organizations/${org.name}/runtime-groups`,
                'PUT'
              ).then(({ apiRes: { status: createStatus } }: any) => {
                expect(createStatus).to.be.equal(200)

                cy.setRequestBody({
                  name: runtimeGroupName,
                  hostedOrganizations: [hostOrgA, hostOrgB],
                })
                cy.callAPI(
                  `ds/api/sdx/v1/organizations/${org.name}/runtime-groups`,
                  'PUT'
                ).then(({ apiRes: { status: addStatus } }: any) => {
                  expect(addStatus).to.be.equal(200)

                  cy.callAPI(
                    `ds/api/sdx/v1/organizations/${org.name}/activity?first=100`,
                    'GET'
                  ).then(({ apiRes: { status, body: activities } }: any) => {
                    expect(status).to.be.equal(200)
                    const added = activities.find(
                      (a: any) =>
                        a.params?.entity === 'RuntimeGroup' &&
                        a.params?.action === 'updated' &&
                        a.params?.runtimeGroupName === runtimeGroupName &&
                        a.params?.hostedOrganizations === expectedHostedList
                    )
                    expect(added?.params?.entity).to.equal('RuntimeGroup')
                    expect(added?.params?.action).to.equal('updated')
                    expect(added?.params?.hostedOrganizations).to.equal(
                      expectedHostedList
                    )
                    expect(added?.result).to.equal('success')

                    cy.setRequestBody({
                      name: runtimeGroupName,
                      hostedOrganizations: [],
                    })
                    cy.callAPI(
                      `ds/api/sdx/v1/organizations/${org.name}/runtime-groups`,
                      'PUT'
                    ).then(({ apiRes: { status: clearStatus } }: any) => {
                      expect(clearStatus).to.be.equal(200)

                      cy.callAPI(
                        `ds/api/sdx/v1/organizations/${org.name}/activity?first=100`,
                        'GET'
                      ).then(
                        ({ apiRes: { status, body: activities } }: any) => {
                          expect(status).to.be.equal(200)
                          const cleared = activities.find(
                            (a: any) =>
                              a.params?.entity === 'RuntimeGroup' &&
                              a.params?.action === 'updated' &&
                              a.params?.runtimeGroupName === runtimeGroupName &&
                              a.params?.hostedOrganizations === ''
                          )
                          expect(cleared?.params?.entity).to.equal(
                            'RuntimeGroup'
                          )
                          expect(cleared?.params?.action).to.equal('updated')
                          expect(cleared?.params?.hostedOrganizations).to.equal(
                            ''
                          )
                          expect(cleared?.result).to.equal('success')
                        }
                      )
                    })
                  })
                })
              })
            }
          )
        }
      )
    })

    it('records delete on organization activity', () => {
      const runtimeGroupName = `${runtimeGroupId}d`
      cy.setRequestBody({
        name: runtimeGroupName,
        hostedOrganizations: [org.name],
      })
      cy.callAPI(
        `ds/api/sdx/v1/organizations/${org.name}/runtime-groups`,
        'PUT'
      ).then(({ apiRes: { status } }: any) => {
        expect(status).to.be.equal(200)

        cy.setQueryString({ force: false })
        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/runtime-groups/${runtimeGroupName}`,
          'DELETE'
        ).then(({ apiRes: { status: deleteStatus } }: any) => {
          expect(deleteStatus).to.be.equal(200)

          cy.callAPI(
            `ds/api/sdx/v1/organizations/${org.name}/activity?first=100`,
            'GET'
          ).then(({ apiRes: { status, body: activities } }: any) => {
            expect(status).to.be.equal(200)
            const deleted = activities.find(
              (a: any) =>
                a.params?.entity === 'RuntimeGroup' &&
                a.params?.action === 'deleted' &&
                a.params?.runtimeGroupName === runtimeGroupName
            )
            expect(deleted?.params?.entity).to.equal('RuntimeGroup')
            expect(deleted?.params?.action).to.equal('deleted')
            expect(deleted?.params?.runtimeGroupName).to.equal(runtimeGroupName)
            expect(deleted?.result).to.equal('success')
          })
        })
      })
    })
  })

  it('keeps v3 organization gateway activity endpoint working', () => {
    cy.callAPI(
      `ds/api/v3/organizations/${workingData.org.name}/activity`,
      'GET'
    ).then(({ apiRes: { status, body } }: any) => {
      expect(status).to.be.equal(200)
      expect(body).to.be.an('array')
    })
  })
})
