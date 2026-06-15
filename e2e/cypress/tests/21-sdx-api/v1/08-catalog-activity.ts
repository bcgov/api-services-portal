import { v4 as uuidv4 } from 'uuid'
import {
  applyOrgPublicKeyPattern,
  applySubsystemPublicKeyPattern,
  clientIdForSubsystem,
  createOASService,
  createSubsystem,
  orgGatewayKeyName,
  publicKeyPemA,
  publicKeyPemB,
  registerOrgGateway,
  subsystemGatewayKeyName,
  uniqueSubsystemName,
} from '../../../support/sdx-commands'

describe('SDX Catalog Activity', () => {
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

  it('records organization establishment in public catalog activity', () => {
    const { org } = workingData

    cy.callAPI(
      `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
      'GET'
    ).then(({ apiRes: { status, body: activities } }: any) => {
      expect(status).to.be.equal(200)
      const entry = activities.find(
        (a: any) =>
          a.params?.entity === 'Organization' &&
          a.params?.action === 'registered' &&
          a.params?.organization === org.name
      )
      expect(entry?.params?.entity).to.equal('Organization')
      expect(entry?.params?.action).to.equal('registered')
      expect(entry?.params?.organization).to.equal(org.name)
      expect(entry?.blob?.title).to.equal(org.title)
      expect(entry?.blob?.description).to.equal(org.description)
      expect(entry?.result).to.equal('success')
    })
  })

  describe('Organization unit profile in catalog activity', () => {
    let org: any
    let orgUnit: any

    before(() => {
      const orgId = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 4)

      cy.loginByAuthAPI('', '').then((token_res: any) => {
        cy.setHeaders({ 'Content-Type': 'application/json' })
        cy.setAuthorizationToken(token_res.token)

        org = {
          name: `ministry-of-hounds-${orgId}`,
          title: 'Ministry of Hounds',
          description: 'Organization for org unit activity test',
          tags: ['member_class:MIN', `member_id:${orgId}`],
          orgUnits: [],
          extSource: 'internal',
          extRecordHash: '',
        }

        cy.setRequestBody(org)
        cy.callAPI('ds/api/v3/organizations/ca.bc.gov', 'PUT').then(
          ({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)
            expect(body.result).to.match(/created/)
          }
        )
      })
    })

    it('records org unit establishment when a unit is added to an organization', () => {
      const orgId = org.tags[1].split(':')[1]
      orgUnit = {
        name: `division-of-pups-${orgId}`,
        title: 'Division of pups',
        description: 'Org unit for catalog activity test',
        tags: [],
        extForeignKey: `division-of-pups-${orgId}`,
        extSource: 'internal',
        extRecordHash: '',
      }

      cy.setRequestBody({ ...org, orgUnits: [orgUnit] })
      cy.callAPI('ds/api/v3/organizations/ca.bc.gov', 'PUT').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.result).to.match(/updated/)

          cy.callAPI(
            `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
            'GET'
          ).then(({ apiRes: { status: activityStatus, body: activities } }: any) => {
            expect(activityStatus).to.be.equal(200)
            const entry = activities.find(
              (a: any) =>
                a.params?.entity === 'OrganizationUnit' &&
                a.params?.action === 'registered' &&
                a.params?.organization === org.name &&
                a.params?.orgUnit === orgUnit.name
            )
            expect(entry?.params?.entity).to.equal('OrganizationUnit')
            expect(entry?.params?.action).to.equal('registered')
            expect(entry?.params?.organization).to.equal(org.name)
            expect(entry?.params?.orgUnit).to.equal(orgUnit.name)
            expect(entry?.blob?.title).to.equal(orgUnit.title)
            expect(entry?.blob?.description).to.equal(orgUnit.description)
            expect(entry?.result).to.equal('success')
          })
        }
      )
    })

    it('records org unit profile updates after establishment', () => {
      const updatedOrgUnit = {
        ...orgUnit,
        title: 'Division of pups (updated)',
        description: 'Updated org unit description for catalog activity test',
      }

      cy.setRequestBody({ ...org, orgUnits: [updatedOrgUnit] })
      cy.callAPI('ds/api/v3/organizations/ca.bc.gov', 'PUT').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.result).to.match(/updated/)

          cy.callAPI(
            `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
            'GET'
          ).then(({ apiRes: { status: activityStatus, body: activities } }: any) => {
            expect(activityStatus).to.be.equal(200)
            const entry = activities.find(
              (a: any) =>
                a.params?.entity === 'OrganizationProfile' &&
                a.params?.action === 'updated' &&
                a.params?.organization === org.name &&
                a.params?.orgUnit === orgUnit.name &&
                a.blob?.title === updatedOrgUnit.title
            )
            expect(entry?.params?.entity).to.equal('OrganizationProfile')
            expect(entry?.params?.action).to.equal('updated')
            expect(entry?.params?.organization).to.equal(org.name)
            expect(entry?.params?.orgUnit).to.equal(orgUnit.name)
            expect(entry?.blob?.title).to.equal(updatedOrgUnit.title)
            expect(entry?.blob?.description).to.equal(updatedOrgUnit.description)
            expect(entry?.result).to.equal('success')
          })
        }
      )
    })

    it('records organization establishment and org unit register when created together', () => {
      const orgId = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 4)
      const orgUnit = {
        name: `division-of-pups-together-${orgId}`,
        title: 'Division of hounds',
        description: 'Org unit created with parent organization',
        tags: [],
        extForeignKey: `division-of-pups-together-${orgId}`,
        extSource: 'internal',
        extRecordHash: '',
      }
      const org = {
        name: `ministry-of-hounds-together-${orgId}`,
        title: 'Ministry of hounds together',
        description: 'Organization created with an org unit',
        tags: ['member_class:MIN', `member_id:${orgId}`],
        orgUnits: [orgUnit],
        extSource: 'internal',
        extRecordHash: '',
      }

      cy.loginByAuthAPI('', '').then((token_res: any) => {
        cy.setHeaders({ 'Content-Type': 'application/json' })
        cy.setAuthorizationToken(token_res.token)
        cy.setRequestBody(org)

        cy.callAPI('ds/api/v3/organizations/ca.bc.gov', 'PUT').then(
          ({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)
            expect(body.result).to.match(/created/)

            cy.callAPI(
              `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
              'GET'
            ).then(({ apiRes: { status: activityStatus, body: activities } }: any) => {
              expect(activityStatus).to.be.equal(200)

              const establishment = activities.find(
                (a: any) =>
                  a.params?.entity === 'Organization' &&
                  a.params?.action === 'registered' &&
                  a.params?.organization === org.name
              )
              expect(establishment?.params?.entity).to.equal('Organization')
              expect(establishment?.params?.action).to.equal('registered')
              expect(establishment?.params?.organization).to.equal(org.name)
              expect(establishment?.blob?.title).to.equal(org.title)
              expect(establishment?.blob?.description).to.equal(org.description)
              expect(establishment?.result).to.equal('success')

              const unitEstablishment = activities.find(
                (a: any) =>
                  a.params?.entity === 'OrganizationUnit' &&
                  a.params?.action === 'registered' &&
                  a.params?.organization === org.name &&
                  a.params?.orgUnit === orgUnit.name
              )
              expect(unitEstablishment?.params?.entity).to.equal('OrganizationUnit')
              expect(unitEstablishment?.params?.action).to.equal('registered')
              expect(unitEstablishment?.params?.organization).to.equal(org.name)
              expect(unitEstablishment?.params?.orgUnit).to.equal(orgUnit.name)
              expect(unitEstablishment?.blob?.title).to.equal(orgUnit.title)
              expect(unitEstablishment?.blob?.description).to.equal(orgUnit.description)
              expect(unitEstablishment?.result).to.equal('success')
            })
          }
        )
      })
    })
  })

  it('records organization profile updates in public catalog activity', () => {
    const { org } = workingData
    const updatedOrg = {
      ...org,
      title: `${org.title} (updated)`,
      description: 'Updated description for catalog activity test',
    }

    cy.setRequestBody(updatedOrg)
    cy.callAPI('ds/api/v3/organizations/ca.bc.gov', 'PUT').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        expect(body.result).to.match(/updated/)

        cy.callAPI(
          `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
          'GET'
        ).then(({ apiRes: { status, body: activities } }: any) => {
          expect(status).to.be.equal(200)
          const entry = activities.find(
            (a: any) =>
              a.params?.entity === 'OrganizationProfile' &&
              a.params?.action === 'updated' &&
              a.params?.organization === org.name
          )
          expect(entry?.params?.entity).to.equal('OrganizationProfile')
          expect(entry?.params?.action).to.equal('updated')
          expect(entry?.params?.organization).to.equal(org.name)
          expect(entry?.blob?.title).to.equal(updatedOrg.title)
          expect(entry?.blob?.description).to.equal(updatedOrg.description)
          expect(entry?.result).to.equal('success')
        })
      }
    )
  })

  it('records organization access changes in public catalog activity', () => {
    const payload = {
      name: workingData.org.name,
      parent: '/ca.bc.gov',
      members: [
        {
          member: {
            email: 'benny@test.com',
          },
          roles: ['organization-admin','system-owner'],
        },
        {
          member: {
            email: 'janis@testmail.com',
          },
          roles: ['organization-admin','system-owner'],
        },
      ],
    }

    cy.setRequestBody(payload)
    cy.callAPI(
      `ds/api/v3/organizations/${workingData.org.name}/access`,
      'PUT'
    ).then(({ apiRes: { status } }: any) => {
      expect(status).to.be.equal(204)

      cy.callAPI(
        `ds/api/sdx/v1/catalog/activity?organization=${workingData.org.name}&first=100`,
        'GET'
      ).then(({ apiRes: { status, body: activities } }: any) => {
        expect(status).to.be.equal(200)
        const entry = activities.find(
          (a: any) =>
            a.params?.entity === 'OrganizationAccess' &&
            a.params?.subject === 'benny@idir' &&
            a.params?.action === 'updated'
        )
        expect(entry?.params?.entity).to.equal('OrganizationAccess')
        expect(entry?.params?.subject).to.equal('benny@idir')
        expect(entry?.params?.subject_email).to.be.undefined
        expect(entry?.params?.action).to.equal('updated')
        expect(entry?.params?.roles).to.include('[+] organization-admin')
        expect(entry?.result).to.equal('success')
      })
    })
  })

  it('records organization CSR requests in public catalog activity', () => {
    const { org, runtimeGroupId } = workingData
    const runtimeGroupName = runtimeGroupId

    cy.setRequestBody({
      name: runtimeGroupName,
      hostedOrganizations: [org.name],
    })
    cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/runtime-groups`, 'PUT').then(
      ({ apiRes: { status } }: any) => {
        expect(status).to.be.equal(200)

        cy.setRequestBody({
          runtimeGroupName,
        })
        cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/keys`, 'POST').then(
          ({ apiRes: { status } }: any) => {
            expect(status).to.be.equal(200)

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
      }
    )
  })

  it('records subsystem lifecycle in public catalog and organization activity', () => {
    const { org } = workingData
    const subsystemName = uniqueSubsystemName()

    createSubsystem(org, subsystemName, ({ result }: any) => {
      expect(result).to.be.equal('created')

      cy.callAPI(
        `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
        'GET'
      ).then(({ apiRes: { status, body: activities } }: any) => {
        expect(status).to.be.equal(200)
        const entry = activities.find(
          (a: any) =>
            a.params?.entity === 'Subsystem' &&
            a.params?.action === 'created' &&
            a.params?.subsystemName === subsystemName &&
            a.params?.organization === org.name
        )
        expect(entry?.params?.entity).to.equal('Subsystem')
        expect(entry?.params?.action).to.equal('created')
        expect(entry?.params?.subsystemName).to.equal(subsystemName)
        expect(entry?.result).to.equal('success')
      })

      cy.callAPI(
        `ds/api/sdx/v1/organizations/${org.name}/activity?first=100`,
        'GET'
      ).then(({ apiRes: { status, body: activities } }: any) => {
        expect(status).to.be.equal(200)
        const entry = activities.find(
          (a: any) =>
            a.params?.entity === 'Subsystem' &&
            a.params?.action === 'created' &&
            a.params?.subsystemName === subsystemName
        )
        expect(entry?.params?.entity).to.equal('Subsystem')
        expect(entry?.params?.action).to.equal('created')
        expect(entry?.result).to.equal('success')
      })

      cy.setQueryString({ force: false })
      cy.callAPI(
        `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystemName}`,
        'DELETE'
      ).then(({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        expect(body.result).to.be.equal('deleted')

        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/activity?first=100`,
          'GET'
        ).then(({ apiRes: { status, body: activities } }: any) => {
          expect(status).to.be.equal(200)
          const entry = activities.find(
            (a: any) =>
              a.params?.entity === 'Subsystem' &&
              a.params?.action === 'deleted' &&
              a.params?.subsystemName === subsystemName
          )
          expect(entry?.params?.action).to.equal('deleted')
          expect(entry?.result).to.equal('success')
        })
      })
    })
  })

  it('records service publish and remove in public catalog activity', () => {
    const { org } = workingData
    const subsystemName = uniqueSubsystemName()

    createSubsystem(org, subsystemName, () => {
      createOASService(org, subsystemName, (service: any) => {
        const serviceName = service.name

        cy.callAPI(
          `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
          'GET'
        ).then(({ apiRes: { status, body: activities } }: any) => {
          expect(status).to.be.equal(200)
          const entry = activities.find(
            (a: any) =>
              a.params?.entity === 'Service' &&
              a.params?.action === 'published' &&
              a.params?.serviceName === serviceName
          )
          expect(entry?.params?.entity).to.equal('Service')
          expect(entry?.params?.action).to.equal('published')
          expect(entry?.params?.serviceName).to.equal(serviceName)
          expect(entry?.params?.subsystemName).to.equal(subsystemName)
          expect(entry?.result).to.equal('success')
        })

        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/oas-services/${serviceName}`,
          'DELETE'
        ).then(({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.result).to.be.equal('deleted')

          cy.callAPI(
            `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
            'GET'
          ).then(({ apiRes: { status, body: activities } }: any) => {
            expect(status).to.be.equal(200)
            const entry = activities.find(
              (a: any) =>
                a.params?.entity === 'Service' &&
                a.params?.action === 'removed' &&
                a.params?.serviceName === serviceName
            )
            expect(entry?.params?.entity).to.equal('Service')
            expect(entry?.params?.action).to.equal('removed')
            expect(entry?.params?.serviceName).to.equal(serviceName)
            expect(entry?.params?.subsystemName).to.equal(subsystemName)
            expect(entry?.result).to.equal('success')
          })
        })
      })
    })
  })

  describe('Organization public key lifecycle in catalog activity', () => {
    // Runs in order: register gateway, apply key A, then rotate/remove tests build on that state.
    let orgKeyName: string

    before(() => {
      const { org } = workingData
      orgKeyName = orgGatewayKeyName(org)

      registerOrgGateway(org.name).then(({ apiRes: { status } }: any) => {
        expect(status).to.be.equal(200)
        applyOrgPublicKeyPattern(org.name, publicKeyPemA).then(
          ({ apiRes: { status: applyStatus } }: any) => {
            expect(applyStatus).to.be.equal(200)
          }
        )
      })
    })

    it('records published activity on initial organization public key apply', () => {
      const { org } = workingData

      cy.callAPI(
        `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
        'GET'
      ).then(({ apiRes: { status, body: activities } }: any) => {
        expect(status).to.be.equal(200)
        const entry = activities.find(
          (a: any) =>
            a.params?.entity === 'OrganizationKey' &&
            a.params?.action === 'published' &&
            a.params?.targetName === org.name
        )
        expect(entry?.params?.entity).to.equal('OrganizationKey')
        expect(entry?.params?.action).to.equal('published')
        expect(entry?.params?.detail).to.include(`published key ${orgKeyName}`)
        expect(entry?.result).to.equal('success')
      })
    })

    it('records published activity when organization public key material changes in-place', () => {
      const { org } = workingData

      applyOrgPublicKeyPattern(org.name, publicKeyPemB).then(
        ({ apiRes: { status } }: any) => {
          expect(status).to.be.equal(200)

          cy.callAPI(
            `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
            'GET'
          ).then(({ apiRes: { status, body: activities } }: any) => {
            expect(status).to.be.equal(200)
            const publishEntries = activities.filter(
              (a: any) =>
                a.params?.entity === 'OrganizationKey' &&
                a.params?.action === 'published' &&
                a.params?.targetName === org.name
            )
            const entry = publishEntries[0]
            expect(entry?.params?.entity).to.equal('OrganizationKey')
            expect(entry?.params?.action).to.equal('published')
            expect(entry?.params?.detail).to.include(`published key ${orgKeyName}`)
            expect(entry?.result).to.equal('success')
          })
        }
      )
    })

    it('records removed activity when organization public key is removed', () => {
      const { org } = workingData

      applyOrgPublicKeyPattern(org.name, publicKeyPemB, 'remove').then(
        ({ apiRes: { status } }: any) => {
          expect(status).to.be.equal(200)

          cy.callAPI(
            `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
            'GET'
          ).then(({ apiRes: { status, body: activities } }: any) => {
            expect(status).to.be.equal(200)
            const entry = activities.find(
              (a: any) =>
                a.params?.entity === 'OrganizationKey' &&
                a.params?.action === 'removed' &&
                a.params?.detail?.includes(`removed key ${orgKeyName}`)
            )
            expect(entry?.params?.entity).to.equal('OrganizationKey')
            expect(entry?.params?.action).to.equal('removed')
            expect(entry?.params?.detail).to.include(`removed key ${orgKeyName}`)
            expect(entry?.result).to.equal('success')
          })
        }
      )
    })
  })

  describe('Subsystem public key lifecycle in catalog activity', () => {
    let subsystemName: string
    let clientId: string
    let subsystemKeyName: string
    const runtimeGroupSuffix = () =>
      uuidv4().replace(/-/g, '').toUpperCase().substring(0, 6).toLowerCase()

    before(() => {
      const { org } = workingData
      subsystemName = uniqueSubsystemName()
      clientId = clientIdForSubsystem(org, subsystemName)
      subsystemKeyName = subsystemGatewayKeyName(clientId)

      createSubsystem(org, subsystemName, () => {
        const runtimeGroupName = runtimeGroupSuffix()
        cy.setRequestBody({
          name: runtimeGroupName,
          hostedOrganizations: [org.name],
          consumerEndpoint: `http://internal.${runtimeGroupName}.servers.sdx`,
        })
        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/runtime-groups`,
          'PUT'
        ).then(({ apiRes: { status } }: any) => {
          expect(status).to.be.equal(200)

          cy.setRequestBody({ runtimeGroupName })
          cy.callAPI(
            `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystemName}/gateway`,
            'PUT'
          ).then(({ apiRes: { status: gatewayStatus } }: any) => {
            expect(gatewayStatus).to.be.equal(200)

            applySubsystemPublicKeyPattern(org.name, clientId, publicKeyPemA).then(
              ({ apiRes: { status: applyStatus } }: any) => {
                expect(applyStatus).to.be.equal(200)
              }
            )
          })
        })
      })
    })

    it('records published activity on initial subsystem public key apply', () => {
      const { org } = workingData

      cy.callAPI(
        `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
        'GET'
      ).then(({ apiRes: { status, body: activities } }: any) => {
        expect(status).to.be.equal(200)
        const entry = activities.find(
          (a: any) =>
            a.params?.entity === 'SubsystemKey' &&
            a.params?.action === 'published' &&
            a.params?.targetName === clientId
        )
        expect(entry?.params?.entity).to.equal('SubsystemKey')
        expect(entry?.params?.action).to.equal('published')
        expect(entry?.params?.targetName).to.equal(clientId)
        expect(entry?.params?.detail).to.include(`published key ${subsystemKeyName}`)
        expect(entry?.result).to.equal('success')
      })
    })

    it('records published activity when subsystem public key material changes', () => {
      const { org } = workingData

      applySubsystemPublicKeyPattern(org.name, clientId, publicKeyPemB).then(
        ({ apiRes: { status } }: any) => {
          expect(status).to.be.equal(200)

          cy.callAPI(
            `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
            'GET'
          ).then(({ apiRes: { status, body: activities } }: any) => {
            expect(status).to.be.equal(200)
            const publishEntries = activities.filter(
              (a: any) =>
                a.params?.entity === 'SubsystemKey' &&
                a.params?.action === 'published' &&
                a.params?.targetName === clientId
            )
            const entry = publishEntries[0]
            expect(entry?.params?.entity).to.equal('SubsystemKey')
            expect(entry?.params?.action).to.equal('published')
            expect(entry?.params?.detail).to.include(`published key ${subsystemKeyName}`)
            expect(entry?.result).to.equal('success')
          })
        }
      )
    })

    it('records removed activity when subsystem public key is removed', () => {
      const { org } = workingData

      applySubsystemPublicKeyPattern(org.name, clientId, publicKeyPemB, 'remove').then(
        ({ apiRes: { status } }: any) => {
          expect(status).to.be.equal(200)

          cy.callAPI(
            `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
            'GET'
          ).then(({ apiRes: { status, body: activities } }: any) => {
            expect(status).to.be.equal(200)
            const entry = activities.find(
              (a: any) =>
                a.params?.entity === 'SubsystemKey' &&
                a.params?.action === 'removed' &&
                a.params?.detail?.includes(`removed key ${subsystemKeyName}`)
            )
            expect(entry?.params?.entity).to.equal('SubsystemKey')
            expect(entry?.params?.action).to.equal('removed')
            expect(entry?.params?.detail).to.include(`removed key ${subsystemKeyName}`)
            expect(entry?.result).to.equal('success')
          })
        }
      )
    })
  })
})
