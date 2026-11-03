import {
  createSubsystem,
  new_service,
  SDX_UI_URL,
  updateSubsystemIntegrationClients,
} from '../../../support/sdx-commands'

const PROVISIONER_URL = 'http://provisioner-api.localtest.me:3030'
const PORTAL_FEED_URL = 'http://apsportal.localtest.me:3000/feed'

const subjectQuery = (subject: string) => `subject:"${subject}"`

describe('CSS onboarding hold', { retries: 0 }, () => {
  before(() => {
    cy.mailpitDeleteAllMessages()
    cy.fixture('toys.v1.yaml', null).as('toys.v1')
    cy.buildOrgGatewayDatasetAndProduct().then(({ org }: any) => {
      const suffix = String(org.name).split('-').pop()
      const providerName = `SUBSYS-${suffix}`
      const consumerName = `CONS-${suffix}`
      const integrationId = `css-${String(suffix).toLowerCase()}`

      new_service(org, providerName, (service: any) => {
        cy.setRequestBody({
          name: providerName,
          privacyZone: 'urn:ca:bc:gov:provider',
        })
        cy.callAPI(
          `ds/api/sdx/v1/organizations/${org.name}/subsystems`,
          'PUT'
        ).then(({ apiRes: { status, body } }: any) => {
          expect(status, body.reason || body.message).to.eq(200)
        })
        createSubsystem(org, consumerName, () => {
          cy.wrap({
            org,
            service,
            consumerName,
            integrationId,
            requester: {
              displayName: 'Jane Doe',
              email: `techlead-${String(suffix).toLowerCase()}@example.gov.bc.ca`,
            },
          }).as('hold')
        })
      })
    })
  })

  it('holds an unregistered request and submits it when the integration is linked', () => {
    cy.get('@hold').then((hold: any) => {
      const { org, service, consumerName, integrationId, requester } = hold
      const request = accessRequest(service, requester)
      const inviteSubject = `SDX onboarding - ${integrationId}`
      const apsSubject = `New onboarding task - ${integrationId}`
      const doneSubject = `SDX onboarding complete - ${integrationId}`
      const inviteUrl = `${SDX_UI_URL}/onboarding/invite?integrationId=${integrationId}`

      postAccessRequest(integrationId, request).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.results[service.name]).to.eq('held for onboarding')
        const firstSubmissionId = response.body.submissionId

        cy.mailpitWaitForEmail(subjectQuery(inviteSubject), 20000).then((message) => {
          cy.mailpitGetMessage(message.ID).then((details) => {
            expect(details.To.map((to) => to.Address)).to.include(requester.email)
            expect(details.HTML).to.include('Common SSO asked SDX for API access')
            expect(details.HTML).to.include('not onboarded yet')
            expect(details.HTML).to.include('onboarding blueprint')
            expect(details.HTML).to.include(`href="${inviteUrl}"`)
          })
        })
        cy.mailpitWaitForEmail(subjectQuery(apsSubject), 20000).then((message) => {
          cy.mailpitGetMessage(message.ID).then((details) => {
            expect(details.HTML).to.include(requester.displayName)
            expect(details.HTML).to.include(requester.email)
            expect(details.HTML).to.include(service.name)
            expect(details.HTML).to.include('kickoff, then organization and subsystem')
          })
        })

        taskByIntegration(integrationId).then((task) => {
          expect(task.status).to.eq('pending')
          expect(task.ref).to.eq(`css-onboarding:${integrationId}`)
          expect(task.jsonBlob.submissionId).to.eq(firstSubmissionId)
        })

        const revised = accessRequest(service, {
          ...requester,
          displayName: 'Janet Doe',
        })
        postAccessRequest(integrationId, revised).then((again) => {
          expect(again.status).to.eq(200)
          expect(again.body.submissionId).to.not.eq(firstSubmissionId)
          expect(again.body.results[service.name]).to.eq('held for onboarding')

          taskByIntegration(integrationId).then((task) => {
            expect(task.status).to.eq('pending')
            expect(task.title).to.include('Janet Doe')
            expect(task.jsonBlob.submissionId).to.eq(again.body.submissionId)
          })
          cy.mailpitAssertMessageCount(subjectQuery(apsSubject), 1)
          cy.mailpitAssertMessageCount(subjectQuery(inviteSubject), 1)

          cy.request({
            method: 'POST',
            url: `${PROVISIONER_URL}/v1/integrations/${integrationId}/onboarding/complete`,
            failOnStatusCode: false,
          }).then((early) => {
            expect(early.status).to.eq(409)
            taskByIntegration(integrationId).then((task) => {
              expect(task.status).to.eq('pending')
            })

            updateSubsystemIntegrationClients(
              org,
              consumerName,
              [integrationId],
              () => {
                cy.request({
                  method: 'GET',
                  url: `${PROVISIONER_URL}/v1/integrations/${integrationId}`,
                }).then((status) => {
                  expect(status.body.status).to.eq('registered')
                })

                cy.request({
                  method: 'POST',
                  url: `${PROVISIONER_URL}/v1/integrations/${integrationId}/onboarding/complete`,
                  timeout: 120000,
                }).then((completed) => {
                  expect(completed.status).to.eq(200)
                  expect(completed.body.submissionId).to.eq(again.body.submissionId)
                  expect(completed.body.results[service.name]).to.eq(
                    'submitted approval request'
                  )
                  taskByIntegration(integrationId).then((task) => {
                    expect(task.status).to.eq('processed')
                  })
                  cy.mailpitAssertMessageCount(subjectQuery(doneSubject), 1)
                  cy.mailpitWaitForEmail(subjectQuery(doneSubject), 20000).then(
                    (message) => {
                      cy.mailpitGetMessage(message.ID).then((details) => {
                        expect(details.To.map((to) => to.Address)).to.include(
                          requester.email
                        )
                        expect(details.HTML).to.include('submitted for approval')
                      })
                    }
                  )

                  cy.request({
                    method: 'POST',
                    url: `${PROVISIONER_URL}/v1/integrations/${integrationId}/onboarding/complete`,
                    timeout: 120000,
                  }).then((repeat) => {
                    expect(repeat.status).to.eq(200)
                    expect(repeat.body).to.deep.eq(completed.body)
                    cy.mailpitAssertMessageCount(subjectQuery(doneSubject), 1)
                  })
                })
              }
            )
          })
        })
      })
    })
  })
})

function accessRequest(
  service: { name: string; environment: string; subsystem: { clientId: string } },
  requester: { displayName: string; email: string }
) {
  return {
    requester,
    clientId: 'css-oauth-client',
    policyVersion: 'SDX.R1.00',
    privacyZone: 'citizen',
    resourceServers: [
      {
        id: service.subsystem.clientId,
        environment: service.environment,
        services: [{ name: service.name, scopes: [] as string[] }],
      },
    ],
  }
}

function postAccessRequest(integrationId: string, body: ReturnType<typeof accessRequest>) {
  return cy.request({
    method: 'POST',
    url: `${PROVISIONER_URL}/v1/integrations/${encodeURIComponent(integrationId)}/access-requests`,
    body,
    timeout: 60000,
  })
}

function taskByIntegration(integrationId: string) {
  const ref = encodeURIComponent(`css-onboarding:${integrationId}`)
  return cy
    .request(`${PORTAL_FEED_URL}/Task/ref/${ref}`)
    .then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.length(1)
      return response.body[0]
    })
}
