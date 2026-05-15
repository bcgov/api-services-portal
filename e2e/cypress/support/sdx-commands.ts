export function uniqueSubsystemName(): string {
  return `SUBSYS-${Cypress._.random(100000, 999999)}`
}

export function clientIdForSubsystem(org: any, subsystemName: string): string {
  const memberClass = org.tags[0].split(':')[1]
  const memberId = org.tags[1].split(':')[1]

  return `LAB.${memberClass}.${memberId}.${subsystemName}`
}

export function createSubsystem(org: any, subsystemName: string, next: any) {
  cy.setRequestBody({
    name: subsystemName,
  })
  cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/subsystems`, 'PUT').then(
    ({ apiRes: { status, body } }: any) => {
      expect(status, body.reason || body.message).to.be.equal(200)
      next(body)
    }
  )
}

export function createOASService(org: any, subsystemName: string, next: any) {
  cy.fixture('toys.v1.yaml', null).then((text: any) => {
    expect(Cypress.Buffer.isBuffer(text)).to.be.true

    const body = text.toString().replace('title: Toys', `title: Toys ${subsystemName}`)

    expect(body).to.include('openapi: 3.1.1')
    expect(body).to.include(`title: Toys ${subsystemName}`)

    cy.setRequestBodyRaw(body)
    cy.setHeader('Content-Type', 'application/octet-stream')
    cy.callAPI(
      `ds/api/sdx/v1/organizations/${org.name}/oas-services?subsystem=${subsystemName}`,
      'PUT',
      false
    ).then(({ apiRes: { status, body } }: any) => {
      expect(status, body.reason || body.message).to.be.equal(200)
      expect(body.result).to.be.equal('created')
      expect(body).has.property('refKey')

      cy.callAPI(
        `ds/api/sdx/v1/organizations/${org.name}/oas-services/${body.refKey}`,
        'GET',
        false
      ).then(({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        next(body)
      })
    })
  })
}

export function createSubsystemAndOASService(org: any, subsystemName: string, next: any) {
  createSubsystem(org, subsystemName, () => {
    createOASService(org, subsystemName, next)
  })
}

export function createConnection(
  org: any,
  clientId: string,
  serviceId: string,
  next: any
) {
  cy.setRequestBody({
    clientId,
    serviceId,
  })
  cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'PUT').then(
    ({ apiRes: { status, body } }: any) => {
      expect(status, body.message).to.be.equal(200)
      expect(body.result).to.be.equal('created')
      expect(typeof body.id).to.be.equal('string')
      next(body.id)
    }
  )
}

export function createRuntimeGroup(
  org: any,
  runtimeGroupName: string,
  consumerEndpoint: string
) {
  cy.setRequestBody({
    name: runtimeGroupName,
    hostedOrganizations: [org.name],
    consumerEndpoint,
  })
  cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/runtime-groups`, 'PUT').then(
    ({ apiRes: { status, body } }: any) => {
      expect(status, body.message).to.be.equal(200)
    }
  )
}
