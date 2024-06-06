describe('API Directory', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
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
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
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
