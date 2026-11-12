import { issuer, publicUrl, siteAUrl, siteBUrl, waitForHttp200, waitForSiteB } from './helpers'

describe('Keycloak site health and issuer', () => {
  it('reports both sites ready within the site B startup budget', () => {
    waitForHttp200(Cypress.env('KEYCLOAK_SITE_A_HEALTH'), 30000).then((response) => {
      expect(response.body.status).to.eq('UP')
    })
    waitForSiteB().then((response) => {
      expect(response.body.status).to.eq('UP')
    })
  })

  it('returns 200 from each site load-balancer check', () => {
    const path = Cypress.env('KEYCLOAK_LB_CHECK_PATH')
    cy.request(`${siteAUrl()}${path}`).then((response) => {
      expect(response.status).to.eq(200)
    })
    cy.request(`${siteBUrl()}${path}`).then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('publishes the same issuer on both sites and the public URL', () => {
    ;[siteAUrl(), siteBUrl(), publicUrl()].forEach((base) => {
      cy.request(`${base}/auth/realms/master/.well-known/openid-configuration`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.issuer).to.eq(issuer())
      })
    })
  })
})
