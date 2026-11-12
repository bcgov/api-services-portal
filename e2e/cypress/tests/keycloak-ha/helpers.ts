const SITE_B_READY_MS = 3 * 60 * 1000

export function publicUrl(): string {
  return Cypress.env('KEYCLOAK_PUBLIC_URL')
}

export function siteAUrl(): string {
  return Cypress.env('KEYCLOAK_SITE_A_URL')
}

export function siteBUrl(): string {
  return Cypress.env('KEYCLOAK_SITE_B_URL')
}

export function issuer(): string {
  return Cypress.env('KEYCLOAK_ISSUER')
}

export function waitForHttp200(url: string, timeoutMs: number): Cypress.Chainable<Cypress.Response<any>> {
  const started = Date.now()
  const attempt = (): Cypress.Chainable<Cypress.Response<any>> => {
    return cy.request({ url, failOnStatusCode: false, timeout: 15000 }).then((response) => {
      if (response.status === 200) {
        return response
      }
      if (Date.now() - started >= timeoutMs) {
        throw new Error(`${url} returned HTTP ${response.status} after ${timeoutMs}ms`)
      }
      return cy.wait(2000).then(() => attempt())
    })
  }
  return attempt()
}

export function waitForSiteB(): Cypress.Chainable<Cypress.Response<any>> {
  return waitForHttp200(Cypress.env('KEYCLOAK_SITE_B_HEALTH'), SITE_B_READY_MS)
}

export function passwordGrant(base: string, username: string, password: string): Cypress.Chainable<Cypress.Response<any>> {
  return cy.request({
    method: 'POST',
    url: `${base}/auth/realms/master/protocol/openid-connect/token`,
    form: true,
    body: {
      grant_type: 'password',
      client_id: 'admin-cli',
      username,
      password,
    },
  })
}

const PORTAL_CLIENT_SECRET = '8e1a17ed-cb93-4806-ac32-e303d1c86018'

export function portalSessionGrant(base: string): Cypress.Chainable<Cypress.Response<any>> {
  return cy.request({
    method: 'POST',
    url: `${base}/auth/realms/master/protocol/openid-connect/token`,
    form: true,
    body: {
      grant_type: 'password',
      client_id: 'aps-portal',
      client_secret: PORTAL_CLIENT_SECRET,
      username: 'local',
      password: 'local',
      scope: 'openid',
    },
  })
}

export function portalRefreshGrant(base: string, refreshToken: string): Cypress.Chainable<Cypress.Response<any>> {
  return cy.request({
    method: 'POST',
    url: `${base}/auth/realms/master/protocol/openid-connect/token`,
    form: true,
    body: {
      grant_type: 'refresh_token',
      client_id: 'aps-portal',
      client_secret: PORTAL_CLIENT_SECRET,
      refresh_token: refreshToken,
    },
  })
}

export function adminToken(base: string): Cypress.Chainable<string> {
  return passwordGrant(base, 'admin', 'local').then((response) => {
    expect(response.status).to.eq(200)
    return response.body.access_token as string
  })
}

export function listClients(base: string, token: string, clientId: string): Cypress.Chainable<Cypress.Response<any>> {
  return cy.request({
    method: 'GET',
    url: `${base}/auth/admin/realms/master/clients`,
    qs: { clientId },
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  })
}

export function pollClient(
  base: string,
  token: string,
  clientId: string,
  present: boolean,
  description?: string,
): Cypress.Chainable<any> {
  const started = Date.now()
  const timeoutMs = 10000
  const attempt = (): Cypress.Chainable<any> => {
    return listClients(base, token, clientId).then((response) => {
      expect(response.status, `list ${clientId} on ${base}`).to.eq(200)
      const clients = response.body as Array<Record<string, unknown>>
      const client = clients.find((item) => item.clientId === clientId) || null
      const descriptionMatches = description === undefined || client?.description === description
      const ready = present ? Boolean(client) && descriptionMatches : !client
      if (ready) {
        return client
      }
      if (Date.now() - started >= timeoutMs) {
        throw new Error(
          `client ${clientId} on ${base} was not ${present ? 'visible' : 'gone'} within ${timeoutMs}ms`,
        )
      }
      return cy.wait(200).then(() => attempt())
    })
  }
  return attempt()
}

export function createClient(base: string, token: string, clientId: string, description: string): Cypress.Chainable<any> {
  return cy
    .request({
      method: 'POST',
      url: `${base}/auth/admin/realms/master/clients`,
      headers: { Authorization: `Bearer ${token}` },
      body: {
        clientId,
        protocol: 'openid-connect',
        publicClient: true,
        enabled: true,
        description,
      },
    })
    .then((response) => {
      expect(response.status).to.eq(201)
      return pollClient(base, token, clientId, true, description)
    })
}

export function updateClientDescription(
  base: string,
  token: string,
  client: Record<string, unknown>,
  description: string,
): Cypress.Chainable<Cypress.Response<any>> {
  const payload = { ...client, description }
  delete payload.access
  return cy.request({
    method: 'PUT',
    url: `${base}/auth/admin/realms/master/clients/${client.id}`,
    headers: { Authorization: `Bearer ${token}` },
    body: payload,
  })
}

export function deleteClient(base: string, token: string, clientId: string): Cypress.Chainable<Cypress.Response<any>> {
  return listClients(base, token, clientId).then((listed) => {
    expect(listed.status).to.eq(200)
    const client = (listed.body as Array<Record<string, unknown>>).find((item) => item.clientId === clientId)
    expect(client, clientId).to.exist
    return cy.request({
      method: 'DELETE',
      url: `${base}/auth/admin/realms/master/clients/${client.id}`,
      headers: { Authorization: `Bearer ${token}` },
    })
  })
}

export function haproxy(command: string): Cypress.Chainable<string> {
  return cy.task('haproxyCommand', command).then((output) => String(output ?? ''))
}
