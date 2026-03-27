describe('Kong 3 Regression', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  describe('Manage Control-Apply Rate limiting to Global and Consumer at Service level ', () => {
    let userSession: any

    beforeEach(() => {
      cy.fixture('common-testdata').as('common-testdata')
    })

    it('authenticates Janis (api owner) to get the user session token', () => {
      cy.get('@common-testdata').then(({ serviceAvailability }: any) => {
        cy.getUserSessionTokenValue(serviceAvailability.namespace, false).then(
          (value) => {
            console.log(value)
            userSession = value
          }
        )
      })
    })

    it('publish gateway config', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      const name = `svc-${gateway.gatewayId}`

      const body = new FormData()
      body.append('dryRun', 'false')
      body.append(
        'configFile',
        new Blob([
          JSON.stringify({
            services: [
              {
                name,
                host: 'httpbun.com',
                port: 443,
                retries: 0,
                protocol: 'https',
                tags: ['ns.' + gateway.gatewayId + '.test-service'],
                routes: [
                  {
                    name,
                    tags: ['ns.' + gateway.gatewayId + '.test-service'],
                    hosts: [`${gateway.gatewayId}.api.gov.bc.ca`],
                    paths: ['/'],
                    methods: ['GET'],
                  },
                ],
                plugins: [
                  {
                    name: 'rate-limiting',
                    tags: ['ns.' + gateway.gatewayId + '.test-service'],
                    config: {
                      minute: 2,
                      policy: 'redis',
                    },
                  },
                ],
              },
            ],
          }),
        ])
      )

      cy.setRequestFormData(body)
      cy.setAuthorizationToken(userSession)

      cy.callAPI(
        'gw/api/v2/namespaces/' + gateway.gatewayId + '/gateway',
        'PUT',
        true
      ).then(({ apiRes: { body, status } }: any) => {
        expect(status).to.be.equal(200)
        cy.log(JSON.stringify(body, null, 2))
        expect(body.message).to.be.equal('Sync successful.')
      })
    })

    it('verify rate limit error when the API calls beyond the limit', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      const subdomain = `${gateway.gatewayId}`

      // we have to wait for the kong changes to be deployed to the data plane
      cy.wait(5000) // unfortunately needs to be here because async is not supported in cypress to do retry logic

      for (let i = 0; i < 2; i++) {
        cy.makeKongProxyRequest(subdomain, 'GET').then((response) => {
          expect(response.status).to.be.equal(200)
        })
      }

      cy.makeKongProxyRequest(subdomain, 'GET').then((response) => {
        expect(response.status).to.be.equal(429)
        expect(response.body.message).to.be.contain('API rate limit exceeded')
      })
    })
  })
})
