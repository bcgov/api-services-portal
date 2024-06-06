const { v4: uuidv4 } = require('uuid')

Cypress.Commands.add('buildOrgGatewayDatasetAndProduct', (): Cypress.Chainable<any> => {
  const datasetId = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 4)

  return cy.loginByAuthAPI('', '').then((token_res: any) => {
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

    // New organization and org unit
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

        // Set permissions for the new Org
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

        // Set permissions for the new Org Unit
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

        // New dataset
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

                // New Gateway
                cy.setRequestBody({})
                return cy
                  .callAPI('ds/api/v3/gateways', 'POST')
                  .then(({ apiRes: { body, status } }: any) => {
                    expect(status).to.be.equal(200)
                    const myGateway = body

                    // Assign gateway to Org
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

                    // New Product and Active Environment
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
