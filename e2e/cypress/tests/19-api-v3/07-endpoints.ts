describe('Endpoints', () => {
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
