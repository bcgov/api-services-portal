import {
  adminToken,
  createClient,
  deleteClient,
  haproxy,
  listClients,
  pollClient,
  portalRefreshGrant,
  portalSessionGrant,
  publicUrl,
  siteAUrl,
  siteBUrl,
  waitForHttp200,
} from './helpers'

describe('Keycloak session failover', () => {
  const clientId = `ha-drain-${Date.now()}`
  let refreshToken = ''
  let accessToken = ''
  let token = ''

  before(() => {
    haproxy('set server sites/site-a state ready')
  })

  after(() => {
    haproxy('set server sites/site-a state ready')
    if (!token) {
      return
    }
    listClients(siteBUrl(), token, clientId).then((response) => {
      const client = (response.body as Array<Record<string, unknown>>).find((item) => item.clientId === clientId)
      if (!client) {
        return
      }
      deleteClient(siteBUrl(), token, clientId)
    })
  })

  it('serves refresh, userinfo, and a new login after site A is drained', () => {
    portalSessionGrant(publicUrl()).then((response) => {
      expect(response.status).to.eq(200)
      refreshToken = response.body.refresh_token
      accessToken = response.body.access_token
    })

    haproxy('set server sites/site-a state drain')

    cy.then(() => portalRefreshGrant(publicUrl(), refreshToken)).then((response) => {
      expect(response.status).to.eq(200)
      accessToken = response.body.access_token
    })

    cy.then(() => {
      return cy.request({
        url: `${publicUrl()}/auth/realms/master/protocol/openid-connect/userinfo`,
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.preferred_username).to.eq('local')
    })

    portalSessionGrant(publicUrl()).then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('shows site B writes to site A after site A is enabled', () => {
    haproxy('set server sites/site-a state drain')
    adminToken(siteBUrl()).then((accessToken) => {
      token = accessToken
      return createClient(siteBUrl(), token, clientId, 'written-while-site-a-drained')
    })

    haproxy('set server sites/site-a state ready')
    waitForHttp200(Cypress.env('KEYCLOAK_SITE_A_HEALTH'), 30000).then((response) => {
      expect(response.body.status).to.eq('UP')
    })

    cy.then(() => pollClient(siteAUrl(), token, clientId, true, 'written-while-site-a-drained'))
  })
})
