describe('SP136 - Catalog organizations includeAccess', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  it('GET /catalog/organizations - does not include access by default', () => {
    const { org } = workingData

    cy.callAPI('ds/api/sdx/v1/catalog/organizations', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)

        const entry = body.find((o: any) => o.name === org.name)
        expect(entry, 'expected the created organization to be in the catalog')
          .to.exist
        expect(entry).to.not.have.property('access')
      }
    )
  })

  it('GET /catalog/organizations?includeAccess=true - includes the RBAC roles granted on the organization', () => {
    const { org } = workingData

    cy.callAPI(
      'ds/api/sdx/v1/catalog/organizations?includeAccess=true',
      'GET'
    ).then(({ apiRes: { status, body } }: any) => {
      expect(status).to.be.equal(200)

      const entry = body.find((o: any) => o.name === org.name)
      expect(entry, 'expected the created organization to be in the catalog')
        .to.exist
      expect(entry.access).to.be.an('array')

      // buildOrgGatewayDatasetAndProduct() grants janis@testmail.com
      // organization-admin + system-admin at the org level as a side effect
      const creator = entry.access.find(
        (m: any) =>
          m.member.email === 'janis@testmail.com' &&
          ['organization-admin', 'system-admin'].every((role) =>
            m.roles.includes(role)
          )
      )
      expect(
        creator,
        'expected janis@testmail.com to hold organization-admin and system-admin on the organization'
      ).to.exist
    })
  })
})
