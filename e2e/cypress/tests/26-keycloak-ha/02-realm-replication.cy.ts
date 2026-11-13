import {
  adminToken,
  createClient,
  deleteClient,
  listClients,
  pollClient,
  siteAUrl,
  siteBUrl,
  updateClientDescription,
} from './helpers'

describe('Keycloak realm data across sites', () => {
  const clientId = `ha-cypress-${Date.now()}`
  let token = ''

  before(() => {
    adminToken(siteAUrl()).then((accessToken) => {
      token = accessToken
    })
  })

  after(() => {
    if (!token) {
      return
    }
    listClients(siteAUrl(), token, clientId).then((response) => {
      const client = (response.body as Array<Record<string, unknown>>).find((item) => item.clientId === clientId)
      if (!client) {
        return
      }
      deleteClient(siteAUrl(), token, clientId)
    })
  })

  it('creates a client on site A and reads it from site B', () => {
    createClient(siteAUrl(), token, clientId, 'created-on-site-a').then(() => {
      return pollClient(siteBUrl(), token, clientId, true, 'created-on-site-a')
    })
  })

  it('updates the client on site B and reads it from site A', () => {
    pollClient(siteBUrl(), token, clientId, true).then((client) => {
      updateClientDescription(siteBUrl(), token, client, 'updated-on-site-b').then((response) => {
        expect(response.status).to.eq(204)
        return pollClient(siteAUrl(), token, clientId, true, 'updated-on-site-b')
      })
    })
  })

  it('deletes the client and both sites drop it', () => {
    deleteClient(siteBUrl(), token, clientId).then((response) => {
      expect(response.status).to.eq(204)
      pollClient(siteAUrl(), token, clientId, false)
      pollClient(siteBUrl(), token, clientId, false)
    })
  })
})
