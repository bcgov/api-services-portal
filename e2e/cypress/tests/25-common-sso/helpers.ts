/// <reference types="cypress" />

export const statusUrl = '/v1/integrations/integration'
export const serversUrl = '/v1/resource-servers?environment=dev'
export const grantsUrl = (environment = 'dev', status = 'approved') =>
  `/v1/integrations/integration/allowed-services?environment=${environment}&status=${status}`
export const submitUrl = '/v1/integrations/integration/access-requests'
export const submission = (
  environment = 'dev',
  service: Record<string, unknown> = {}
) => ({
  requester: { displayName: 'CSS user', email: 'css@example.test' },
  clientId: `client-${environment}`,
  privacyZone: 'urn:consumer',
  policyVersion: 'SDX.R1.00',
  resourceServers: [
    {
      id: 'claims',
      environment,
      services: [
        { name: `claims-${environment}`, version: '1.0.0', scopes: ['read'], ...service },
      ],
    },
  ],
})
export const grant = (environment: string, version = '1.0.0', scopes = ['read']) => [
  {
    id: 'claims',
    environment,
    services: [{ name: `claims-${environment}`, version, scopes }],
  },
]
export const run = (input: unknown) =>
  cy.task('cssContract', input) as Cypress.Chainable<any>
export function problem(result: any, status: number, code: string) {
  expect(result.status).eq(status)
  expect(result.contentType).contain('application/problem+json')
  expect(result.body).include({ status, code })
  expect(result.body.type).match(/^https:\/\/errors\.sdx\.gov\.bc\.ca\//)
}
