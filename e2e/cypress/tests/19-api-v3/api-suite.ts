/**
 * Prerequisites:
 * - Organization and Organization Unit (ministry-of-health) exists
 */

const { v4: uuidv4 } = require('uuid')

function buildGatewayDatasetAndProduct() {
  const datasetId = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 4)

  return cy.loginByAuthAPI('', '').then(() => {
    return cy.get('@loginByAuthApiResponse').then((token_res: any) => {
      cy.setHeaders({ 'Content-Type': 'application/json' })
      cy.setAuthorizationToken(token_res.token)

      // just reference the dataset id for easier tracing
      const orgId = datasetId

      const org = {
        name: `ministry-of-kittens-${orgId}`,
        title: 'Some good title about kittens',
        description: 'Some good description about kittens',
        tags: [],
        orgUnits: [
          {
            name: `division-of-toys-${orgId}`,
            title: 'Division of fun toys to play',
            description: 'Some good description about how we manage our toys',
            tags: [],
            extForeignKey: `division-of-toys-${orgId}`,
            extSource: 'internal',
            extRecordHash: '',
          },
        ],
        extSource: 'internal',
        extRecordHash: '',
      }

      cy.setRequestBody(org)
      return cy
        .callAPI('ds/api/v3/organizations/ca.bc.gov', 'PUT')
        .then(({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)

          const orgAccess = {
            name: org.name,
            parent: `/ca.bc.gov`,
            members: [
              {
                member: {
                  email: 'janis@testmail.com',
                },
                roles: ['organization-admin'],
              },
            ],
          }
          cy.setRequestBody(orgAccess)

          cy.callAPI(`ds/api/v3/organizations/ca.bc.gov/access`, 'PUT').then(
            ({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(204)
            }
          )

          const orgUnitAccess = {
            name: org.orgUnits[0].name,
            parent: `/ca.bc.gov/${org.name}`,
            members: [
              {
                member: {
                  email: 'janis@testmail.com',
                },
                roles: ['organization-admin'],
              },
            ],
          }
          cy.setRequestBody(orgUnitAccess)

          cy.callAPI(`ds/api/v3/organizations/ca.bc.gov/access`, 'PUT').then(
            ({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(204)
            }
          )

          const payload = {
            name: `org-dataset-${datasetId}`,
            license_title: 'Open Government Licence - British Columbia',
            security_class: 'PUBLIC',
            view_audience: 'Public',
            download_audience: 'Public',
            record_publish_date: '2017-09-05',
            notes: 'Some notes',
            title: 'A title about my dataset',
            tags: ['tag1', 'tag2'],
            organization: org.name,
            organizationUnit: org.orgUnits[0].name,
          }
          cy.setRequestBody(payload)
          return cy
            .callAPI(`ds/api/v3/organizations/${org.name}/datasets`, 'PUT')
            .then(({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(200)

              const match = { status: 200, result: 'created', childResults: [] }
              const datasetId = body.id
              delete body.id
              expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))

              return cy
                .callAPI(
                  `ds/api/v3/organizations/${org.name}/datasets/${payload.name}`,
                  'GET'
                )
                .then(({ apiRes: { status, body } }: any) => {
                  expect(status).to.be.equal(200)

                  const match = {
                    name: payload.name,
                    license_title: 'Open Government Licence - British Columbia',
                    security_class: 'PUBLIC',
                    view_audience: 'Public',
                    download_audience: 'Public',
                    record_publish_date: '2017-09-05',
                    notes: 'Some notes',
                    title: 'A title about my dataset',
                    isInCatalog: false,
                    isDraft: true,
                    tags: ['tag1', 'tag2'],
                    organization: {
                      name: org.name,
                      title: 'Some good title about kittens',
                      tags: [],
                      description: 'Some good description about kittens',
                    },
                    organizationUnit: {
                      name: org.orgUnits[0].name,
                      title: 'Division of fun toys to play',
                      tags: [],
                      description: 'Some good description about how we manage our toys',
                    },
                  }
                  expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))

                  cy.setRequestBody({})
                  return cy
                    .callAPI('ds/api/v3/gateways', 'POST')
                    .then(({ apiRes: { body, status } }: any) => {
                      expect(status).to.be.equal(200)
                      const myGateway = body

                      cy.callAPI(
                        `ds/api/v3/organizations/${org.name}/${org.orgUnits[0].name}/gateways/${myGateway.gatewayId}?enable=true`,
                        'PUT'
                      ).then(({ apiRes: { status, body } }: any) => {
                        expect(status).to.be.equal(200)
                        expect(body.result).to.be.equal('namespace-assigned')
                      })

                      const product = {
                        name: `my-product-on-${myGateway.gatewayId}`,
                        dataset: payload.name,
                        environments: [
                          {
                            name: 'dev',
                            active: true,
                            approval: false,
                            flow: 'public',
                          },
                        ],
                      }
                      cy.setRequestBody(product)

                      return cy
                        .callAPI(
                          `ds/api/v3/gateways/${myGateway.gatewayId}/products`,
                          'PUT'
                        )
                        .then(({ apiRes: { body, status } }: any) => {
                          expect(status).to.be.equal(200)

                          const match = {
                            status: 200,
                            result: 'created',
                            childResults: [],
                          }
                          delete body.id
                          expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))

                          return {
                            org,
                            gateway: myGateway,
                            dataset: payload,
                            datasetId,
                            product,
                          }
                        })
                    })
                })
            })
        })
    })
  })
}

describe('API Directory', () => {
  let workingData: any

  before(() => {
    buildGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  it('PUT /organizations/{org}/datasets', () => {
    const { org, gateway, dataset, datasetId, product } = workingData

    cy.callAPI(`ds/api/v3/directory/${datasetId}`, 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)

        const match = {
          name: dataset.name,
          title: 'A title about my dataset',
          notes: 'Some notes',
          license_title: 'Open Government Licence - British Columbia',
          security_class: 'PUBLIC',
          view_audience: 'Public',
          tags: ['tag1', 'tag2'],
          record_publish_date: '2017-09-05',
          isInCatalog: false,
          organization: {
            name: org.name,
            title: 'Some good title about kittens',
          },
          organizationUnit: {
            name: org.orgUnits[0].name,
            title: 'Division of fun toys to play',
          },
          products: [
            {
              name: `my-product-on-${gateway.gatewayId}`,
              environments: [{ name: 'dev', active: true, flow: 'public', services: [] }],
            },
          ],
        }
        delete body.products[0].id
        expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))
      }
    )
  })

  it('GET /directory', () => {
    cy.callAPI('ds/api/v3/directory', 'GET').then(({ apiRes: { status, body } }: any) => {
      cy.log(`Directory ${JSON.stringify(body, null, 4)}`)
      expect(status).to.be.equal(200)
      expect(body.length).to.be.greaterThan(0)
    })
  })

  it('GET /directory/{id}', () => {
    cy.callAPI('ds/api/v3/directory', 'GET').then(({ apiRes: { status, body } }: any) => {
      cy.log(`Directory ${JSON.stringify(body, null, 4)}`)
      expect(status).to.be.equal(200)
    })
  })
})

describe('API Directory (Gateway Management)', () => {
  let workingData: any

  before(() => {
    buildGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  it('GET /gateways/{gatewayId}/datasets/{name}', () => {
    const { org, gateway, dataset, datasetId, product } = workingData
    cy.callAPI(
      `ds/api/v3/gateways/${gateway.gatewayId}/datasets/${dataset.name}`,
      'GET'
    ).then(({ apiRes: { status, body } }: any) => {
      expect(status).to.be.equal(200)

      const match = {
        name: dataset.name,
        license_title: 'Open Government Licence - British Columbia',
        security_class: 'PUBLIC',
        view_audience: 'Public',
        download_audience: 'Public',
        record_publish_date: '2017-09-05',
        notes: 'Some notes',
        title: 'A title about my dataset',
        isInCatalog: false,
        isDraft: true,
        tags: ['tag1', 'tag2'],
        organization: {
          name: org.name,
          title: 'Some good title about kittens',
          tags: [],
          description: 'Some good description about kittens',
        },
        organizationUnit: {
          name: org.orgUnits[0].name,
          title: 'Division of fun toys to play',
          tags: [],
          description: 'Some good description about how we manage our toys',
        },
      }

      delete body.id

      expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))
    })
  })

  it('GET /gateways/{gatewayId}/directory', () => {
    const { org, gateway, dataset, datasetId, product } = workingData
    cy.callAPI(`ds/api/v3/gateways/${gateway.gatewayId}/directory`, 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)

        const match = [
          {
            name: dataset.name,
            title: 'A title about my dataset',
            notes: 'Some notes',
            license_title: 'Open Government Licence - British Columbia',
            view_audience: 'Public',
            security_class: 'PUBLIC',
            record_publish_date: '2017-09-05',
            tags: ['tag1', 'tag2'],
            organization: {
              name: org.name,
              title: 'Some good title about kittens',
            },
            organizationUnit: {
              name: org.orgUnits[0].name,
              title: 'Division of fun toys to play',
            },
            products: [
              {
                name: product.name,
                environments: [{ name: 'dev', active: true, flow: 'public' }],
              },
            ],
          },
        ]

        delete body[0].products[0].id
        delete body[0].id

        expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))
      }
    )
  })

  it('GET /gateways/{gatewayId}/directory/{id}', () => {
    const { org, gateway, dataset, datasetId, product } = workingData
    cy.callAPI(
      `ds/api/v3/gateways/${gateway.gatewayId}/directory/${datasetId}`,
      'GET'
    ).then(({ apiRes: { status, body } }: any) => {
      expect(status).to.be.equal(200)

      const match = {
        name: dataset.name,
        title: 'A title about my dataset',
        notes: 'Some notes',
        license_title: 'Open Government Licence - British Columbia',
        security_class: 'PUBLIC',
        view_audience: 'Public',
        tags: ['tag1', 'tag2'],
        record_publish_date: '2017-09-05',
        isInCatalog: false,
        organization: {
          name: org.name,
          title: 'Some good title about kittens',
        },
        organizationUnit: {
          name: org.orgUnits[0].name,
          title: 'Division of fun toys to play',
        },
        products: [
          {
            name: product.name,
            environments: [{ name: 'dev', active: true, flow: 'public', services: [] }],
          },
        ],
      }

      delete body.products[0].id
      delete body.id

      expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))
    })
  })
})

describe('Organization', () => {
  before(() => {
    cy.loginByAuthAPI('', '').then(() => {
      cy.get('@loginByAuthApiResponse').then((token_res: any) => {
        cy.setHeaders({ 'Content-Type': 'application/json' })
        cy.setAuthorizationToken(token_res.token)
      })
    })
  })

  it('GET /organizations', () => {
    cy.callAPI('ds/api/v3/organizations', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        expect(
          body.filter((o: any) => o.name == 'ministry-of-health').length
        ).to.be.equal(1)
      }
    )
  })
  it('GET /organizations/{org}', () => {
    cy.callAPI('ds/api/v3/organizations/ministry-of-health', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        expect(
          body.orgUnits.filter((o: any) => o.name == 'public-health').length
        ).to.be.equal(1)
      }
    )
  })

  it('GET /organizations/{org}/roles', () => {
    const match = {
      name: 'ministry-of-health',
      parent: '/ca.bc.gov',
      roles: [
        {
          name: 'organization-admin',
          permissions: [
            {
              resource: 'org/ministry-of-health',
              scopes: ['Dataset.Manage', 'GroupAccess.Manage', 'Namespace.Assign'],
            },
          ],
        },
      ],
    }

    cy.callAPI('ds/api/v3/organizations/ministry-of-health/roles', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))
      }
    )
  })

  it('GET /organizations/{org}/access', () => {
    const match = {
      name: 'ministry-of-health',
      parent: '/ca.bc.gov',
      members: [],
    }

    cy.callAPI('ds/api/v3/organizations/ministry-of-health/access', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))
      }
    )
  })

  it('PUT /organizations/{org}/access', () => {
    const payload = {
      name: 'planning-and-innovation-division',
      parent: '/ca.bc.gov/ministry-of-health',
      members: [
        {
          member: {
            email: 'mark@gmail.com',
          },
          roles: ['organization-admin'],
        },
      ],
    }
    cy.setRequestBody(payload)

    cy.callAPI(
      'ds/api/v3/organizations/planning-and-innovation-division/access',
      'PUT'
    ).then(({ apiRes: { status, body } }: any) => {
      expect(status).to.be.equal(204)

      cy.callAPI(
        'ds/api/v3/organizations/planning-and-innovation-division/access',
        'GET'
      ).then(({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)

        const match = {
          name: 'planning-and-innovation-division',
          parent: '/ca.bc.gov/ministry-of-health',
          members: [
            {
              member: {
                username: 'mark@idir',
                email: 'mark@gmail.com',
              },
              roles: ['organization-admin'],
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

  it('GET /organizations/{org}/gateways', () => {
    const match = {
      name: 'platform',
      orgUnit: 'planning-and-innovation-division',
      enabled: false,
      updatedAt: 0,
    }

    cy.callAPI('ds/api/v3/organizations/ministry-of-health/gateways', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        expect(
          JSON.stringify(body.filter((a: any) => a.name == 'platform').pop())
        ).to.be.equal(JSON.stringify(match))
      }
    )
  })

  it('GET /organizations/{org}/activity', () => {
    cy.callAPI('ds/api/v3/organizations/ministry-of-health/activity', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        // expect(JSON.stringify(body.filter(a => a.params.ns == ))).to.be.equal(JSON.stringify(match))
      }
    )
  })

  it('PUT /organizations/{org}/{orgUnit}/gateways/{gatewayId}', () => {
    cy.setRequestBody({})
    cy.callAPI('ds/api/v3/gateways', 'POST').then(({ apiRes: { body, status } }: any) => {
      expect(status).to.be.equal(200)
      const myGateway = body

      cy.setRequestBody({})
      cy.callAPI(
        `ds/api/v3/organizations/ministry-of-health/planning-and-innovation-division/gateways/${myGateway.gatewayId}?enable=true`,
        'PUT'
      ).then(({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        expect(body.result).to.be.equal('namespace-assigned')
      })
    })
  })

  it('GET /roles', () => {
    const match: any = {
      'organization-admin': {
        label: 'Organization Administrator',
        permissions: [
          {
            resourceType: 'organization',
            scopes: ['GroupAccess.Manage', 'Namespace.Assign', 'Dataset.Manage'],
          },
          { resourceType: 'namespace', scopes: ['Namespace.View'] },
        ],
      },
    }

    cy.callAPI('ds/api/v3/roles', 'GET').then(({ apiRes: { status, body } }: any) => {
      expect(status).to.be.equal(200)
      expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))
    })
  })
})

describe('Gateways', () => {
  let LOCAL: { myGateway?: any } = {}

  before(() => {
    cy.loginByAuthAPI('', '').then(() => {
      cy.get('@loginByAuthApiResponse').then((token_res: any) => {
        cy.setHeaders({ 'Content-Type': 'application/json' })
        cy.setAuthorizationToken(token_res.token)
      })
    })
  })

  it('POST /gateways', () => {
    const payload = {
      displayName: 'My ABC Gateway',
    }
    cy.setRequestBody(payload)
    cy.callAPI('ds/api/v3/gateways', 'POST').then(({ apiRes: { body, status } }: any) => {
      expect(status).to.be.equal(200)
      cy.log(JSON.stringify(body, null, 2))
      expect(body.displayName).to.be.equal(payload.displayName)
      LOCAL.myGateway = body
    })
  })

  it('GET /gateways/{gatewayId}', () => {
    cy.callAPI(`ds/api/v3/gateways/${LOCAL.myGateway.gatewayId}`, 'GET').then(
      ({ apiRes: { body, status } }: any) => {
        expect(status).to.be.equal(200)
        cy.log(JSON.stringify(body, null, 2))
        expect(body.displayName).to.be.equal(LOCAL.myGateway.displayName)
      }
    )
  })

  it('GET /gateways/{gatewayId}/activity', () => {
    cy.callAPI(`ds/api/v3/gateways/${LOCAL.myGateway.gatewayId}/activity`, 'GET').then(
      ({ apiRes: { body, status } }: any) => {
        expect(status).to.be.equal(200)
        cy.log(JSON.stringify(body, null, 2))
        expect(body.length).to.be.equal(1)
        expect(body[0].message).to.be.equal('{actor} created {ns} namespace')
        expect(body[0].params.ns).to.be.equal(LOCAL.myGateway.gatewayId)
      }
    )
  })

  // it('DELETE /gateways/{gatewayId}', () => {
  //   cy.callAPI(`ds/api/v3/gateways/${LOCAL.myGateway.gatewayId}`, 'DELETE').then(
  //     ({ apiRes: { body, status } }: any) => {
  //       expect(status).to.be.equal(200)
  //       cy.log(JSON.stringify(body, null, 2))
  //     }
  //   )
  // })
})

describe('Products', () => {
  let LOCAL: { myGateway?: any } = {}

  before(() => {
    cy.loginByAuthAPI('', '').then(() => {
      cy.get('@loginByAuthApiResponse').then((token_res: any) => {
        cy.setHeaders({ 'Content-Type': 'application/json' })
        cy.setAuthorizationToken(token_res.token)
        cy.setRequestBody({})
        cy.callAPI('ds/api/v3/gateways', 'POST').then(
          ({ apiRes: { body, status } }: any) => {
            expect(status).to.be.equal(200)
            LOCAL.myGateway = body
          }
        )
      })
    })
  })

  it('PUT /gateways/{gatewayId}/products', () => {
    cy.setRequestBody({
      name: `my-product-on-${LOCAL.myGateway.gatewayId}`,
      environments: [
        {
          name: 'dev',
          active: false,
          approval: false,
          flow: 'public',
        },
      ],
    })
    cy.callAPI(`ds/api/v3/gateways/${LOCAL.myGateway.gatewayId}/products`, 'PUT').then(
      ({ apiRes: { body, status } }: any) => {
        expect(status).to.be.equal(200)
        cy.log(JSON.stringify(body))
      }
    )
  })

  it('GET /gateways/{gatewayId}/products', () => {
    cy.callAPI(`ds/api/v3/gateways/${LOCAL.myGateway.gatewayId}/products`, 'GET').then(
      ({ apiRes: { body, status } }: any) => {
        expect(status).to.be.equal(200)
        cy.log(JSON.stringify(body, null, 2))
        expect(body.length).to.be.equal(1)
        expect(body[0].name).to.be.equal(`my-product-on-${LOCAL.myGateway.gatewayId}`)
        expect(body[0].environments.length).to.be.equal(1)
      }
    )
  })
})

describe('Authorization Profiles', () => {
  let LOCAL: { myGateway?: any } = {}

  before(() => {
    cy.loginByAuthAPI('', '').then(() => {
      cy.get('@loginByAuthApiResponse').then((token_res: any) => {
        cy.setHeaders({ 'Content-Type': 'application/json' })
        cy.setAuthorizationToken(token_res.token)
        cy.setRequestBody({})
        cy.callAPI('ds/api/v3/gateways', 'POST').then(
          ({ apiRes: { body, status } }: any) => {
            expect(status).to.be.equal(200)
            LOCAL.myGateway = body
          }
        )
      })
    })
  })

  it('PUT /gateways/{gatewayId}/issuers', () => {
    cy.setRequestBody({
      name: `my-auth-profile-for-${LOCAL.myGateway.gatewayId}`,
      description: 'Auth connection to my IdP',
      flow: 'client-credentials',
      clientAuthenticator: 'client-secret',
      mode: 'auto',
      inheritFrom: 'Sample Shared IdP',
    })
    cy.callAPI(`ds/api/v3/gateways/${LOCAL.myGateway.gatewayId}/issuers`, 'PUT').then(
      ({ apiRes: { body, status } }: any) => {
        expect(status).to.be.equal(200)
        cy.log(JSON.stringify(body))
      }
    )
  })

  it('GET /gateways/{gatewayId}/issuers', () => {
    cy.callAPI(`ds/api/v3/gateways/${LOCAL.myGateway.gatewayId}/issuers`, 'GET').then(
      ({ apiRes: { body, status } }: any) => {
        expect(status).to.be.equal(200)
        cy.log(JSON.stringify(body, null, 2))
        expect(body.length).to.be.equal(1)

        const issuer = body[0]

        expect(issuer.name).to.be.equal(
          `my-auth-profile-for-${LOCAL.myGateway.gatewayId}`
        )
        expect(issuer.environmentDetails[0].environment).to.be.equal('test')
        expect(issuer.environmentDetails[0].issuerUrl).to.be.equal(
          Cypress.env('OIDC_ISSUER')
        )
        expect(issuer.environmentDetails[0].clientId).to.be.equal(
          `ap-my-auth-profile-for-${LOCAL.myGateway.gatewayId}-test`
        )
      }
    )
  })
})

describe('Identifiers', () => {
  it('GET /identifiers/application', () => {
    cy.callAPI('ds/api/v3/identifiers/application', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        cy.log(`ID ${body}`)
        expect(status).to.be.equal(200)
      }
    )
  })

  it('GET /identifiers/product', () => {
    cy.callAPI('ds/api/v3/identifiers/product', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        cy.log(`ID ${body}`)
        expect(status).to.be.equal(200)
      }
    )
  })

  it('GET /identifiers/environment', () => {
    cy.callAPI('ds/api/v3/identifiers/environment', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        cy.log(`ID ${body}`)
        expect(status).to.be.equal(200)
      }
    )
  })

  it('GET /identifiers/gateway', () => {
    cy.callAPI('ds/api/v3/identifiers/gateway', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        cy.log(`ID ${body}`)
        expect(status).to.be.equal(200)
      }
    )
  })
})
