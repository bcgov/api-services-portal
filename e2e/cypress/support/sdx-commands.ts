import { v4 as uuidv4 } from 'uuid'

export function uniqueSubsystemName(): string {
  return `SUBSYS-${Cypress._.random(100000, 999999)}`
}

export function clientIdForSubsystem(org: any, subsystemName: string): string {
  const memberClass = org.tags[0].split(':')[1]
  const memberId = org.tags[1].split(':')[1]

  return `${memberClass}.${memberId}.${subsystemName}`
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

export function updateSubsystemIntegrationClients(
  org: any,
  subsystemName: string,
  clients: string[],
  next: any
) {
  cy.setRequestBody({
    name: subsystemName,
    integrations: clients.map((c) => ({ integrationClientId: c })),
  })
  cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/subsystems`, 'PUT').then(
    ({ apiRes: { status, body } }: any) => {
      expect(status, body.reason || body.message).to.be.equal(200)

      next(body)
    }
  )
}

export function createSubsystemGateway(
  org: any,
  runtimeGroupName: string,
  subsystemName: string,
  next: any
) {
  cy.setRequestBody({
    runtimeGroupName,
  })
  cy.callAPI(
    `ds/api/sdx/v1/organizations/${org.name}/subsystems/${subsystemName}/gateway`,
    'PUT'
  ).then(({ apiRes: { status, body } }: any) => {
    expect(status, body.message).to.be.equal(200)
    expect(body).to.have.property('gatewayId')
    next(body)
  })
}

export function createOASService(
  org: any,
  subsystemName: string,
  environment: string,
  next: any
) {
  cy.fixture('toys.v1.yaml', null).then((text: any) => {
    expect(Cypress.Buffer.isBuffer(text)).to.be.true

    const body = text.toString().replace('title: Toys', `title: Toys ${subsystemName}`)

    expect(body).to.include('openapi: 3.1.1')
    expect(body).to.include(`title: Toys ${subsystemName}`)

    cy.setRequestBodyRaw(body)
    cy.setHeader('Content-Type', 'application/octet-stream')
    cy.callAPI(
      `ds/api/sdx/v1/organizations/${org.name}/oas-services?subsystem=${subsystemName}&environment=${environment}`,
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

export function createSubsystemAndOASService(
  org: any,
  subsystemName: string,
  environment: string,
  next: any
) {
  createSubsystem(org, subsystemName, () => {
    createOASService(org, subsystemName, environment, next)
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
    policyVersion: 'SDX.R0.00',
    environment: 'lab',
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
  environment: string,
  consumerEndpoint?: string,
  sdxEndpoint?: string
) {
  cy.setRequestBody({
    name: runtimeGroupName,
    environment,
    hostedOrganizations: [org.name],
    consumerEndpoint,
    sdxEndpoint,
  })
  return cy
    .callAPI(`ds/api/sdx/v1/organizations/${org.name}/runtime-groups`, 'PUT')
    .then(({ apiRes: { status, body } }: any) => {
      expect(status, body.message).to.be.equal(200)
    })
}

export function updateRuntimeGroupAddHostedOrg(
  org: any,
  runtimeGroupName: string,
  environment: string,
  hostedOrg: string
) {
  // get the runtime-group first, and then append the new hostOrganization
  return cy
    .callAPI(`ds/api/sdx/v1/organizations/${org.name}/runtime-groups?filter=owned`, 'GET')
    .then(({ apiRes: { status, body } }: any) => {
      expect(status, body.message).to.be.equal(200)
      const runtimeGroup = body.find((rg: any) => rg.name === runtimeGroupName)
      expect(runtimeGroup, `Runtime group ${runtimeGroupName} not found`).to.exist

      const hostedOrganizations = runtimeGroup.hostedOrganizations || []
      if (!hostedOrganizations.includes(hostedOrg)) {
        hostedOrganizations.push(hostedOrg)
      }
      cy.setRequestBody({
        name: runtimeGroupName,
        environment,
        hostedOrganizations,
        sdxEndpoint: runtimeGroup.sdxEndpoint,
        consumerEndpoint: runtimeGroup.consumerEndpoint,
      })
      return cy
        .callAPI(`ds/api/sdx/v1/organizations/${org.name}/runtime-groups`, 'PUT')
        .then(({ apiRes: { status, body } }: any) => {
          expect(status, body.message).to.be.equal(200)
        })
    })
}

export function new_service(org: any, subsystemName: string, next: any) {
  const rg = uuidv4().replace(/-/g, '').toLowerCase().substring(0, 6)

  const payload = {
    name: subsystemName,
  }
  cy.setRequestBody(payload)
  cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/subsystems`, 'PUT').then(
    ({ apiRes: { status } }: any) => {
      expect(status).to.be.equal(200)

      // create runtime group and add subsystem gateway
      createRuntimeGroup(org, rg, 'dev').then(() => {
        createSubsystemGateway(org, rg, subsystemName, () => {
          cy.get('@toys.v1').then((text: any) => {
            expect(Cypress.Buffer.isBuffer(text)).to.be.true
            const body = text.toString()
            expect(body).to.include('openapi: 3.1.1')

            cy.setRequestBodyRaw(body)
            cy.setHeader('Content-Type', 'application/octet-stream')
            cy.callAPI(
              `ds/api/sdx/v1/organizations/${org.name}/oas-services?subsystem=${subsystemName}&environment=lab`,
              'PUT',
              false
            ).then(({ apiRes: { status, body } }: any) => {
              // expect(status).to.be.equal(200)
              expect(JSON.stringify(body)).to.include('created')
              cy.callAPI(
                `ds/api/sdx/v1/organizations/${org.name}/oas-services`,
                'GET',
                false
              ).then(({ apiRes: { status, body } }: any) => {
                expect(status).to.be.equal(200)
                assert(body.length > 0, 'Expected at least one service in response')
                next(body[0])
              })
            })
          })
        })
      })
    }
  )
}

export function createJanisOrgAndAccess() {
  const org = {
    name: 'user-janis',
    title: 'User Janis',
    description: '',
    extSource: 'custom',
    extRecordHash: '0000',
    tags: ['member_class:USR', 'member_id:JANIS'],
    orgUnits: [],
  }
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
            roles: ['organization-admin', 'system-owner'],
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
    })
}

export async function sdxFetchCall(options: {
  method: string
  path: string
  body?: string
}): Promise<{ status: number; body: any }> {
  return await fetch(`http://kong-sdx-edge0.localtest.me:9080${options.path}`, {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body,
  }).then(async (response) => {
    const status = response.status
    const body = await response.json().catch(() => ({}))
    return { status, body }
  })
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
  action: 'apply' | 'delete' = 'apply'
) {
  cy.setRequestBody({
    parameters: {
      organization: orgName,
      publicKeyPem: publicKeyPem,
    },
  })
  cy.setQueryString({ action })
  return cy.callAPI(`ds/api/sdx/v1/organizations/${orgName}/patterns/sdx-keys.r1`, 'PUT')
}

export function applySubsystemPublicKeyPattern(
  orgName: string,
  clientId: string,
  environment: string,
  publicKeyPem: string,
  action: 'apply' | 'delete' = 'apply'
) {
  cy.setRequestBody({
    parameters: {
      organization: orgName,
      environment: environment,
      clientId: clientId,
      publicKeyPem: publicKeyPem,
    },
  })
  cy.setQueryString({ action })
  return cy.callAPI(`ds/api/sdx/v1/organizations/${orgName}/patterns/sdx-keys.r1`, 'PUT')
}
