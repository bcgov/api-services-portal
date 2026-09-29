import { new_service } from '../../support/sdx-commands'

const sdxUiUrl = 'http://sdx-ui.localtest.me:5500'

describe('Notification Service - Connection Request Emails', () => {
  before(() => {
    cy.mailpitDeleteAllMessages()
  })

  it('links the access manager to the SDX connections page for the service organization', () => {
    cy.fixture('toys.v1.yaml', null).as('toys.v1')
    cy.buildOrgGatewayDatasetAndProduct().then((data: any) => {
      const { org, datasetId } = data
      new_service(org, `SUBSYS-${datasetId.toUpperCase()}`, (service: any) => {
        const payload = {
          clientId: service.subsystem.clientId,
          serviceId: service.name,
          policyVersion: 'SDX.R0.00',
          environment: 'dev',
        }
        cy.setRequestBody(payload)
        cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/connections`, 'PUT').then(
          ({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)
            expect(body.result).to.be.equal('created')

            const expectedUrl = `${sdxUiUrl}/connections?org=${encodeURIComponent(
              org.name
            )}`
            cy.mailpitWaitForEmail(
              `subject:"Connection Request - ${service.name}"`,
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
                cy.origin(
                  'http://sdx-ui.localtest.me:5500',
                  { args: { expectedUrl } },
                  ({ expectedUrl }) => {
                    cy.visit(expectedUrl)
                  }
                )
                cy.origin(
                  'http://keycloak.localtest.me:9081',
                  {
                    args: {
                      username: Cypress.env('DEV_USERNAME'),
                      password: Cypress.env('DEV_PASSWORD'),
                    },
                  },
                  ({ username, password }) => {
                    cy.get('#username', { timeout: 20000 }).type(username)
                    cy.get('#password').type(password, { log: false })
                    cy.get('#kc-login').click()
                  }
                )
                cy.origin(
                  'http://sdx-ui.localtest.me:5500',
                  { args: { serviceName: service.name } },
                  ({ serviceName }) => {
                    cy.contains(serviceName, { timeout: 20000 })
                      .closest('article')
                      .within(() => {
                        cy.contains('Pending').should('be.visible')
                        cy.contains('Approve / Reject').should('be.visible')
                      })
                  }
                )
              })
            })
          }
        )
      })
    })
  })
})
