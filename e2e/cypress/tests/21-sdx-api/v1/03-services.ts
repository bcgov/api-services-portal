describe('SDX Services', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  describe('Services Happy Paths', () => {
    it('GET /catalog/services', () => {
      const { org, gateway, dataset, datasetId, product } = workingData

      cy.callAPI(`ds/api/sdx/v1/catalog/services`, 'GET').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.length).to.be.greaterThan(0)
          for (const service of body) {
            expect(service).to.have.property('name')
            expect(service).to.have.property('title')
            expect(service).to.have.property('version')
            expect(service).to.have.property('title')
            expect(service).to.have.property('description')
            expect(service).to.have.property('subsystem')
            expect(service).to.have.property('operations')
          }
        }
      )
    })
  })
})
