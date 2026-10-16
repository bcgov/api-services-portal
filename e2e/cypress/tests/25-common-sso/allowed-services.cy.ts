/// <reference types="cypress" />

// Offline route/service contract coverage; approval orchestration is a separate deployment check.
describe('CSS allowed-services partner contract', () => {
  for (const environment of ['dev', 'test']) {
    it(`returns and delivers only ${environment} grants to mock CSS`, () => {
      cy.task('cssContract', {
        url: `/v1/integrations/integration/allowed-services?environment=${environment}&status=approved`, callback: true,
      }).then((result: any) => {
        expect(result.status).eq(200)
        expect(result.body.clientId).eq(`client-${environment}`)
        expect(result.body.resourceServers).deep.eq([{ id: 'claims', environment, services: [{ name: `claims-${environment}`, scopes: ['read'], version: '1.0.0' }] }])
        expect(result.callbacks).deep.eq([{ method: 'PUT', path: '/requests/integration/sdx-allowed-access', body: result.body }])
      })
    })
  }
  for (const [claims, noToken, status] of [
    [{}, true, 401], [{ exp: 1 }, false, 401], [{ iss: 'wrong' }, false, 401],
    [{ aud: 'wrong' }, false, 401], [{ scope: 'other' }, false, 403],
  ] as const) {
    it(`rejects unauthorized caller ${JSON.stringify({ claims, noToken })}`, () => {
      cy.task('cssContract', { url: '/v1/integrations/integration/allowed-services?environment=dev&status=approved', claims, noToken })
        .then((result: any) => { expect(result.status).eq(status); expect(result.callbacks).deep.eq([]) })
    })
  }
  for (const [query, status] of [['environment=dev', 400], ['environment=prod&status=approved', 404], ['environment=dev&status=invalid', 400]] as const) {
    it(`rejects invalid or unmatched query ${query}`, () => {
      cy.task('cssContract', { url: `/v1/integrations/integration/allowed-services?${query}` })
        .then((result: any) => expect(result.status).eq(status))
    })
  }
  it('maps mock CSS failure to 502', () => {
    cy.task('cssContract', { url: '/v1/integrations/integration/allowed-services?environment=test&status=approved', callback: true, cssStatus: 503 })
      .then((result: any) => expect(result.callbackStatus).eq(502))
  })
})
