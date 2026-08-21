import LoginPage from '../../pageObjects/login'
import ConsumersPage from '../../pageObjects/consumers'
import {
  FLOW_KEYS,
  SuiteState,
  issueConsumer,
  loadSuiteState,
  regenerateConsumer,
  useBearerToken,
  withIssuerToken,
  getClientCredentialsToken,
} from './helpers'

/**
 * Authorization (missing CredentialIssuer.Generate → 403),
 * Consumers UI visibility + label filter, and UI-only revoke/delete.
 * Depends on 00-setup.cy.ts suite state.
 */
describe('24 Self-issuing credentials — authz, labels, revoke', () => {
  const login = new LoginPage()
  const consumers = new ConsumersPage()

  let state: SuiteState
  let labeledClientId = ''
  let labeledApiKey = ''

  before(() => {
    loadSuiteState().then((s) => {
      state = s
    })
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
  })

  describe('Authorization', () => {
    it('returns 403 when issuing without CredentialIssuer.Generate', () => {
      const flow = state.flows[FLOW_KEYS.apiKeyOnly]
      const env = flow.envs.find((e) => e.name === 'dev')!

      withIssuerToken(state.controlSa, () => {
        issueConsumer(state.gatewayId, {
          environmentAppId: env.environmentAppId,
          application: {
            name: 'should-be-forbidden',
            description: 'Missing Generate scope',
          },
        }).then(({ apiRes }: any) => {
          expect(apiRes.status).to.eq(403)
        })
      })
    })

    it('returns 403 when regenerating without CredentialIssuer.Generate', () => {
      const flow = state.flows[FLOW_KEYS.apiKeyOnly]
      const env = flow.envs.find((e) => e.name === 'dev')!

      // First create a credential with the issuer SA so we have a real clientId
      withIssuerToken(state.issuerSa, () => {
        issueConsumer(state.gatewayId, {
          environmentAppId: env.environmentAppId,
          application: {
            name: `authz-regen-target-${Date.now()}`,
          },
        }).then(({ apiRes }: any) => {
          expect(apiRes.status).to.eq(201)
          const clientId = apiRes.body.clientId

          getClientCredentialsToken(
            state.controlSa.clientId,
            state.controlSa.clientSecret
          ).then((token) => {
            useBearerToken(token)
            regenerateConsumer(state.gatewayId, clientId).then(
              ({ apiRes: regenRes }: any) => {
                expect(regenRes.status).to.eq(403)
              }
            )
          })
        })
      })
    })
  })

  describe('Consumers UI — labels and revoke', () => {
    it('issues a labeled API-key consumer for UI checks', () => {
      const flow = state.flows[FLOW_KEYS.apiKeyAcl]
      const env = flow.envs.find((e) => e.name === 'dev')!

      withIssuerToken(state.issuerSa, () => {
        issueConsumer(state.gatewayId, {
          environmentAppId: env.environmentAppId,
          application: {
            name: `ui-labeled-tenant-${Date.now()}`,
            description: 'Visible on Consumers page',
          },
          labels: {
            'issued-by': 'my-service',
            team: 'suite-24',
          },
        }).then(({ apiRes }: any) => {
          expect(apiRes.status).to.eq(201)
          labeledClientId = apiRes.body.clientId
          labeledApiKey = apiRes.body.apiKey
        })
      })
    })

    it('logs in as Janis and activates the gateway', () => {
      cy.visit('/')
      cy.get('@apiowner').then(({ user }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
      })
      cy.activateGateway(state.gatewayId)
    })

    it('shows the consumer on the Consumers page and filters by label', () => {
      cy.visit(consumers.path)
      cy.wait(2000)

      // Filter by Labels: issued-by = my-service
      consumers.verifyFilterResults('Labels', 'issued-by', '1', 'my-service')

      cy.get(consumers.allConsumerTable)
        .contains(labeledClientId)
        .should('exist')
    })

    it('revokes/deletes the consumer via Consumers UI (no DELETE API yet)', () => {
      cy.visit(consumers.path)
      cy.wait(1000)
      consumers.filterConsumerByTypeAndValue('Labels', 'issued-by', 'my-service')
      cy.wait(1000)

      consumers.deleteConsumer(labeledClientId)
      cy.contains('This action cannot be undone').should('be.visible')
      cy.contains('Yes, Delete').click()
      cy.verifyToastMessage('Consumer deleted')

      cy.wait(2000)
      cy.visit(consumers.path)
      consumers.filterConsumerByTypeAndValue('Labels', 'issued-by', 'my-service')
      cy.get(consumers.allConsumerTable).then(($tbl) => {
        expect($tbl.text()).to.not.include(labeledClientId)
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
