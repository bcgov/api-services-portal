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

export const publicKeyPemA = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7YUiYt5uUxVY6yOzwZil
5JlFJlRLxXmG08w/uOMb18Tfwb+5UZ4zEAIgiAgq2Fq+GKyiXN/qId9mySAiANUE
HjjpnpOpAmKU6RsP+Emw54Fco/RMqkHGl2syNCWpgs+yqZ6ZXbw6wn5OfkaL0hB9
id7p8yX/mxqH96ycdA/e3sZQ53X41EXfZl29E654K+LeEtMa+Hy0hIRz+bDOyptM
yEllT/YWhWqhYA/JX+2VklnQ3k82dvvFGMGIS1yYkQuAIEg07TTEHcVAn31eov6T
+KHEVt70CdzgR9MK25U7u8V9Kp0JaKbmfPraCvo/BKzo/nNJa8RfIZvPvp/hKiSy
HwIDAQAB
-----END PUBLIC KEY-----`

export const publicKeyPemB = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtCakFxv/0+vpsocaigFF
68fa6N2avit6LLLvcOwl6k/J13T3/mP/ALpOKyBmk0O/duiSeeUfsqm/Qbs3ASwW
YCvpK6WRyo0xAdo7W3MvwPhHAIa7glic/LNvxuUZdWsW30sKrl2oRrvxPxY2lBkD
wBg2VVA6Dq2cyusfegGDFq2e+f9YTildBljPOBHugXG3a+A/7ZRgKpIu4eu9U+Pj
M12XMokf2owgpkT/b49bUYL0bqB+vzc+pViajneoxlPngRUVyRoZRduP7yK1p+bV
S2jKMiCW1pr8CU26fbma7xHNoLGimmenkAqRhXiONSxKnsmGgoZvaFQzpqGKGxWc
dQIDAQAB
-----END PUBLIC KEY-----`

export function orgGatewayKeyName(org: { tags: string[] }): string {
  const memberClass = org.tags[0].split(':')[1].toLowerCase()
  const memberId = org.tags[1].split(':')[1].toLowerCase()
  return `sdx.keys.${memberClass}.${memberId}.org:0`
}

export function subsystemGatewayKeyName(clientId: string): string {
  return `sdx.keys.${clientId.toLowerCase()}.sys:0`
}

export function registerHostOrganization(name: string, memberId: string) {
  cy.setRequestBody({
    name,
    title: name,
    description: 'e2e host org for runtime group activity',
    tags: ['member_class:MIN', `member_id:${memberId}`],
    orgUnits: [],
    extSource: 'ckan',
    extRecordHash: '',
  })
  return cy.callAPI('ds/api/v3/organizations/ca.bc.gov', 'PUT')
}

export function registerOrgGateway(orgName: string) {
  cy.setRequestBody({})
  return cy.callAPI(`ds/api/sdx/v1/organizations/${orgName}/gateway`, 'PUT')
}

export function applyOrgPublicKeyPattern(
  orgName: string,
  publicKeyPem: string,
  action: 'apply' | 'remove' = 'apply'
) {
  cy.setRequestBody({
    pattern: 'sdx-keys.r1',
    parameters: {
      organization: orgName,
      public_key_pem: publicKeyPem,
    },
  })
  cy.setQueryString({ action, dryRun: 'false' })
  return cy.callAPI(`ds/api/sdx/v1/organizations/${orgName}/pattern`, 'PUT')
}

export function applySubsystemPublicKeyPattern(
  orgName: string,
  clientId: string,
  publicKeyPem: string,
  action: 'apply' | 'remove' = 'apply'
) {
  cy.setRequestBody({
    pattern: 'sdx-keys.r1',
    parameters: {
      organization: orgName,
      client_id: clientId,
      public_key_pem: publicKeyPem,
    },
  })
  cy.setQueryString({ action, dryRun: 'false' })
  return cy.callAPI(`ds/api/sdx/v1/organizations/${orgName}/pattern`, 'PUT')
}
