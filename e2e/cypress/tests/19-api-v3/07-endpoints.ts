describe('Endpoints - unused service', () => {
  it('GET /routes/availability', () => {
    cy.callAPI(
      'ds/api/v3/routes/availability?gatewayId=gw-1234&serviceName=testme',
      'GET'
    ).then(({ apiRes: { status, body } }: any) => {
      const match = {
        available: true,
        suggestion: {
          serviceName: 'testme',
          names: ['testme', 'testme-dev', 'testme-test'],
          hosts: [
            'testme.api.gov.bc.ca',
            'testme.dev.api.gov.bc.ca',
            'testme.test.api.gov.bc.ca',
            'testme-api-gov-bc-ca.dev.api.gov.bc.ca',
            'testme-api-gov-bc-ca.test.api.gov.bc.ca',
          ],
        },
      }
      expect(status).to.be.equal(200)
      expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))
    })
  })
})

describe('Endpoints - used service', () => {
  let userSession: any

  beforeEach(() => {
    cy.fixture('common-testdata').as('common-testdata')
  })
  
  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.get('@common-testdata').then(({ serviceAvailability }: any) => {
      cy.getUserSessionTokenValue(serviceAvailability.namespace, false).then((value) => {
        console.log(value)
        userSession = value
      })
    })
  })

  it('Check gwa config command to set environment', () => {
    var cleanedUrl = Cypress.env('BASE_URL').replace(/^http?:\/\//i, '')
    cy.executeCliCommand('gwa config set --host ' + cleanedUrl + ' --scheme http').then(
      (response) => {
        expect(response.stdout).to.contain('Config settings saved')
      }
    )
  })

  it('Check gwa config command to set token', () => {
    cy.executeCliCommand('gwa config set --token ' + userSession).then((response) => {
      expect(response.stdout).to.contain('Config settings saved')
    })
  })

  it('create namespace with cli', () => {
    cy.get('@common-testdata').then(({ serviceAvailability }: any) => {
      cy.executeCliCommand(
        'gwa gateway create --gateway-id ' + serviceAvailability.namespace + ' --display-name="Service Availability"'
      ).then((response) => {
        expect(response.stdout).to.contain(serviceAvailability.namespace)
      })
    })
  })

  it('Upload config for key-auth', () => {
    cy.executeCliCommand('gwa apply -i ./cypress/fixtures/service-availability.yml').then((response) => {
      expect(response.stdout).to.contain('Gateway Services published');
    })
  })

  it('GET /routes/availability', () => {
    cy.callAPI(
      'ds/api/v3/routes/availability?gatewayId=gw-1234&serviceName=taken-service-name',
      'GET'
    ).then(({ apiRes: { status, body } }: any) => {
      const match = {
        available: false,
        suggestion: {
          serviceName: "gw-1234-taken-service-name",
          names: [
            "gw-1234-taken-service-name",
            "gw-1234-taken-service-name-dev",
            "gw-1234-taken-service-name-test"
          ],
          hosts: [
            "gw-1234-taken-service-name.api.gov.bc.ca",
            "gw-1234-taken-service-name.dev.api.gov.bc.ca",
            "gw-1234-taken-service-name.test.api.gov.bc.ca",
            "gw-1234-taken-service-name-api-gov-bc-ca.dev.api.gov.bc.ca",
            "gw-1234-taken-service-name-api-gov-bc-ca.test.api.gov.bc.ca"
          ]
        },
      }
      expect(status).to.be.equal(200)
      expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))
    })
  })
})