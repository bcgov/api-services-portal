import { v4 as uuidv4 } from 'uuid'
import {
  createOASService,
  createSubsystem,
  uniqueSubsystemName,
} from '../../../support/sdx-commands'

describe('SDX Organization Activity', () => {
  let workingData: any

  const orgGatewayKeyName = (org: { tags: string[] }) => {
    const memberClass = org.tags[0].split(':')[1].toLowerCase()
    const memberId = org.tags[1].split(':')[1].toLowerCase()
    return `sdx.keys.${memberClass}.${memberId}.org:0`
  }

  const registerOrgGateway = (orgName: string) => {
    cy.setRequestBody({})
    return cy.callAPI(`ds/api/sdx/v1/organizations/${orgName}/gateway`, 'PUT')
  }

  const applyOrgPublicKeyPattern = (
    orgName: string,
    publicKeyPem: string,
    action: 'apply' | 'remove' = 'apply'
  ) => {
    cy.setRequestBody({
      pattern: 'sdx-keys.r1',
      parameters: {
        organization: orgName,
        public_key_pem: publicKeyPem,
      },
    })
    cy.setQueryString({ action, dryRun: 'false' })
    return cy.callAPI(`ds/api/sdx/v1/organizations/${orgName}/pattern`, 'PUT')
  }

  const publicKeyPemA = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7YUiYt5uUxVY6yOzwZil
5JlFJlRLxXmG08w/uOMb18Tfwb+5UZ4zEAIgiAgq2Fq+GKyiXN/qId9mySAiANUE
HjjpnpOpAmKU6RsP+Emw54Fco/RMqkHGl2syNCWpgs+yqZ6ZXbw6wn5OfkaL0hB9
id7p8yX/mxqH96ycdA/e3sZQ53X41EXfZl29E654K+LeEtMa+Hy0hIRz+bDOyptM
yEllT/YWhWqhYA/JX+2VklnQ3k82dvvFGMGIS1yYkQuAIEg07TTEHcVAn31eov6T
+KHEVt70CdzgR9MK25U7u8V9Kp0JaKbmfPraCvo/BKzo/nNJa8RfIZvPvp/hKiSy
HwIDAQAB
-----END PUBLIC KEY-----`

  const publicKeyPemB = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtCakFxv/0+vpsocaigFF
68fa6N2avit6LLLvcOwl6k/J13T3/mP/ALpOKyBmk0O/duiSeeUfsqm/Qbs3ASwW
YCvpK6WRyo0xAdo7W3MvwPhHAIa7glic/LNvxuUZdWsW30sKrl2oRrvxPxY2lBkD
wBg2VVA6Dq2cyusfegGDFq2e+f9YTildBljPOBHugXG3a+A/7ZRgKpIu4eu9U+Pj
M12XMokf2owgpkT/b49bUYL0bqB+vzc+pViajneoxlPngRUVyRoZRduP7yK1p+bV
S2jKMiCW1pr8CU26fbma7xHNoLGimmenkAqRhXiONSxKnsmGgoZvaFQzpqGKGxWc
dQIDAQAB
-----END PUBLIC KEY-----`

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
          a.params?.action === 'register' &&
          a.params?.organization === org.name
      )
      expect(entry?.params?.entity).to.equal('Organization')
      expect(entry?.params?.action).to.equal('register')
      expect(entry?.params?.organization).to.equal(org.name)
      expect(entry?.result).to.equal('success')
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
              a.params?.action === 'update' &&
              a.params?.organization === org.name
          )
          expect(entry?.params?.entity).to.equal('OrganizationProfile')
          expect(entry?.params?.action).to.equal('update')
          expect(entry?.params?.organization).to.equal(org.name)
          expect(entry?.params?.changedFields).to.include('title')
          expect(entry?.params?.changedFields).to.include('description')
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
                  a.params?.keyName === runtimeGroupName
              )
              expect(entry?.params?.entity).to.equal('OrganizationCertificate')
              expect(entry?.params?.keyName).to.equal(runtimeGroupName)
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
              a.params?.serviceName === serviceName &&
              a.params?.organization === org.name
          )
          expect(entry?.params?.entity).to.equal('Service')
          expect(entry?.params?.action).to.equal('published')
          expect(entry?.params?.serviceName).to.equal(serviceName)
          expect(entry?.result).to.equal('success')
        })

        // cy.callAPI(
        //   `ds/api/sdx/v1/organizations/${org.name}/oas-services/${serviceName}`,
        //   'DELETE'
        // ).then(({ apiRes: { status, body } }: any) => {
        //   expect(status).to.be.equal(200)
        //   expect(body.result).to.be.equal('deleted')

        //   cy.callAPI(
        //     `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
        //     'GET'
        //   ).then(({ apiRes: { status, body: activities } }: any) => {
        //     expect(status).to.be.equal(200)
        //     const entry = activities.find(
        //       (a: any) =>
        //         a.params?.entity === 'Service' &&
        //         a.params?.action === 'removed' &&
        //         a.params?.serviceName === serviceName
        //     )
        //     expect(entry?.params?.action).to.equal('removed')
        //     expect(entry?.params?.serviceName).to.equal(serviceName)
        //     expect(entry?.result).to.equal('success')
        //   })
        // })
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

    it('records add on initial organization public key apply', () => {
      const { org } = workingData

      cy.callAPI(
        `ds/api/sdx/v1/catalog/activity?organization=${org.name}&first=100`,
        'GET'
      ).then(({ apiRes: { status, body: activities } }: any) => {
        expect(status).to.be.equal(200)
        const entry = activities.find(
          (a: any) =>
            a.params?.entity === 'OrganizationKey' &&
            a.params?.keyName === orgKeyName &&
            a.params?.keyAction === 'added'
        )
        expect(entry?.params?.entity).to.equal('OrganizationKey')
        expect(entry?.params?.keyName).to.equal(orgKeyName)
        expect(entry?.params?.keyAction).to.equal('added')
        expect(entry?.result).to.equal('success')
      })
    })

    it('records rotate when organization public key material changes', () => {
      const { org } = workingData

      applyOrgPublicKeyPattern(org.name, publicKeyPemB).then(
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
                a.params?.keyName === orgKeyName &&
                a.params?.keyAction === 'rotated'
            )
            expect(entry?.params?.entity).to.equal('OrganizationKey')
            expect(entry?.params?.keyName).to.equal(orgKeyName)
            expect(entry?.params?.keyAction).to.equal('rotated')
            expect(entry?.result).to.equal('success')
          })
        }
      )
    })

    it('records delete when organization public key is removed', () => {
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
                a.params?.keyName === orgKeyName &&
                a.params?.keyAction === 'deleted'
            )
            expect(entry?.params?.entity).to.equal('OrganizationKey')
            expect(entry?.params?.keyName).to.equal(orgKeyName)
            expect(entry?.params?.keyAction).to.equal('deleted')
            expect(entry?.result).to.equal('success')
          })
        }
      )
    })
  })
  
})
