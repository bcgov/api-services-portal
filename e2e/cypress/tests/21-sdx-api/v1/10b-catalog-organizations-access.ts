describe('SP136 - Catalog organizations includeAccess', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  it('GET /catalog/organizations/{name} - does not include access by default', () => {
    const { org } = workingData

    cy.callAPI(
      `ds/api/sdx/v1/catalog/organizations/${org.name}`,
      'GET'
    ).then(({ apiRes: { status, body } }: any) => {
      expect(status).to.be.equal(200)
      expect(body.name).to.be.equal(org.name)
      expect(body).to.not.have.property('access')
    })
  })

  it('GET /catalog/organizations/{name}?includeAccess=true - includes the RBAC roles granted on the organization', () => {
    const { org } = workingData

    cy.callAPI(
      `ds/api/sdx/v1/catalog/organizations/${org.name}?includeAccess=true`,
      'GET'
    ).then(({ apiRes: { status, body } }: any) => {
      expect(status).to.be.equal(200)
      expect(body.name).to.be.equal(org.name)
      expect(body.access).to.be.an('array')

      // buildOrgGatewayDatasetAndProduct() grants janis@testmail.com
      // organization-admin + system-admin at the org level as a side effect
      const creator = body.access.find(
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
