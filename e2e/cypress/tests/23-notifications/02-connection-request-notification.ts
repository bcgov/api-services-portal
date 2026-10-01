import {
  clearSdxUiSession,
  createConnection,
  deleteConnection,
  new_service,
  SDX_UI_URL,
  sdxUiLogin,
  updateConnection,
  waitForConnectionProvisioned,
} from '../../support/sdx-commands'

const emailSubject = (subject: string, serviceName: string) =>
  `subject:"${subject} - ${serviceName}"`

describe('Notification Service - Connection Request Emails', () => {
  beforeEach(() => {
    // The SDX UI session from a previous run would otherwise still be valid
    clearSdxUiSession()
    cy.mailpitDeleteAllMessages()
    cy.fixture('toys.v1.yaml', null).as('toys.v1')
    cy.buildOrgGatewayDatasetAndProduct().then(({ org, datasetId }: any) => {
      new_service(org, `SUBSYS-${datasetId.toUpperCase()}`, (service: any) => {
        cy.wrap({
          org,
          service,
          clientId: service.subsystem.clientId,
          serviceId: service.name,
        }).as('connectionCtx')
      })
    })
  })

  it('links the access manager to the SDX connections page for the service organization', () => {
    cy.get('@connectionCtx').then(({ org, service, clientId }: any) => {
      cy.setRequestBody({
        clientId,
        serviceId: service.name,
        policyVersion: 'SDX.R0.00',
        environment: 'dev',
      })
      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'PUT').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.result).to.be.equal('created')

          const expectedUrl = `${SDX_UI_URL}/connections?org=${encodeURIComponent(
            org.name
          )}`
          cy.mailpitWaitForEmail(
            emailSubject('Connection Request', service.name),
            20000
          ).then((message) => {
            cy.mailpitGetMessage(message.ID).then((details) => {
              expect(details.HTML).to.include(`href="${expectedUrl}"`)
              cy.request({
                url: expectedUrl,
                followRedirect: false,
                failOnStatusCode: false,
              }).then((response) => {
                expect(response.status).to.eq(302)
                expect(
                  decodeURIComponent(String(response.headers.location))
                ).to.include(`/connections?org=${org.name}`)
              })

              // The brochure keeps its org catalog in memory. Reload it so
              // the organization created in this test is selectable, then
              // open the email link itself.
              cy.request({
                url: `${expectedUrl}&refresh=1`,
                followRedirect: false,
                failOnStatusCode: false,
              })
              sdxUiLogin()
              cy.visit(expectedUrl)
              cy.contains(service.name, { timeout: 20000 })
                .closest('article')
                .within(() => {
                  cy.contains('Pending').should('be.visible')
                  cy.contains('Approve / Reject').should('be.visible')
                })
            })
          })
        }
      )
    })
  })

  // A connection must be inactive, and its gateway config removed by the
  // provisioner, before it can be deleted. Rejecting or revoking an active
  // connection is therefore a deactivate followed by a delete, and each user
  // action should still send the requester a single email.
  describe('requester emails', () => {
    it('sends one rejected email when a pending request is deleted', () => {
      cy.get('@connectionCtx').then(({ org, clientId, serviceId }: any) => {
        // The SDX UI creates requests inactive and rejects them with a delete
        createConnection(
          org,
          clientId,
          serviceId,
          (id: string) => {
            deleteConnection(org, id)
            cy.mailpitAssertMessageCount(
              emailSubject('Connection Request Rejected', serviceId),
              1
            )
            cy.mailpitAssertMessageCount(
              emailSubject('Connection Revoked', serviceId),
              0,
              0
            )
          },
          { isActive: false }
        )
      })
    })

    it('sends one rejected email when an active pending request is rejected', () => {
      cy.get('@connectionCtx').then(({ org, clientId, serviceId }: any) => {
        createConnection(org, clientId, serviceId, (id: string) => {
          updateConnection(org, clientId, serviceId, { isActive: false })
          deleteConnection(org, id)
          cy.mailpitAssertMessageCount(
            emailSubject('Connection Request Rejected', serviceId),
            1
          )
        })
      })
    })

    it('sends one revoked email when an approved connection is revoked', () => {
      cy.get('@connectionCtx').then(({ org, clientId, serviceId }: any) => {
        createConnection(
          org,
          clientId,
          serviceId,
          (id: string) => {
            updateConnection(org, clientId, serviceId, { isApproved: true })
            updateConnection(org, clientId, serviceId, { isActive: true })
            waitForConnectionProvisioned(org, id)
            cy.mailpitAssertMessageCount(
              emailSubject('Connection Request Approved', serviceId),
              1
            )

            // Revoking is a deactivate, then a delete once the config is gone
            updateConnection(org, clientId, serviceId, { isActive: false })
            deleteConnection(org, id)
            cy.mailpitAssertMessageCount(
              emailSubject('Connection Revoked', serviceId),
              1
            )
          },
          { isActive: false }
        )
      })
    })
  })
})
