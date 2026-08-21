import LoginPage from '../../pageObjects/login'
import ConsumersPage from '../../pageObjects/consumers'
import {
  FLOW_KEYS,
  SuiteState,
  applicationAppIdFromClientId,
  issueConsumer,
  loadSuiteState,
  withIssuerToken,
} from './helpers'

/**
 * Delete Consumer must remove ownerless Applications when they have no
 * remaining ServiceAccess, but keep them when reused across environments.
 * Depends on 00-setup.cy.ts suite state.
 */
describe('24 Self-issuing credentials — orphan Application cleanup', () => {
  const login = new LoginPage()
  const consumers = new ConsumersPage()

  let state: SuiteState

  before(() => {
    loadSuiteState().then((s) => {
      state = s
      expect(state.gatewayId, 'suite state from 00-setup').to.be.a('string')
    })
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
  })

  describe('single-env ownerless app is deleted with consumer', () => {
    let clientId = ''
    let appId = ''
    const label = 'orphan-app-cleanup'

    it('issues an ownerless consumer', () => {
      const flow = state.flows[FLOW_KEYS.apiKeyOnly]
      const env = flow.envs.find((e) => e.name === 'dev')!

      withIssuerToken(state.issuerSa, () => {
        issueConsumer(state.gatewayId, {
          environmentAppId: env.environmentAppId,
          application: {
            name: `orphan-cleanup-${Date.now()}`,
            description: 'Should be deleted with consumer',
          },
          labels: { 'issued-by': label },
        }).then(({ apiRes }: any) => {
          expect(apiRes.status).to.eq(201)
          clientId = apiRes.body.clientId
          appId = applicationAppIdFromClientId(clientId, env.environmentAppId)
        })
      })
    })

    it('deletes the consumer via UI', () => {
      cy.visit('/')
      cy.deleteAllCookies()
      cy.reload(true)
      cy.get('@apiowner').then(({ user }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
      })
      cy.activateGateway(state.gatewayId)
      cy.visit(consumers.path)
      cy.wait(1000)
      consumers.filterConsumerByTypeAndValue('Labels', 'issued-by', label)
      cy.wait(1000)
      consumers.deleteConsumer(clientId)
      cy.contains('This action cannot be undone').should('be.visible')
      cy.contains('Yes, Delete').click()
      cy.verifyToastMessage('Consumer deleted')
    })

    it('cannot reuse the deleted Application appId', () => {
      const flow = state.flows[FLOW_KEYS.apiKeyOnly]
      const env = flow.envs.find((e) => e.name === 'dev')!

      withIssuerToken(state.issuerSa, () => {
        issueConsumer(state.gatewayId, {
          environmentAppId: env.environmentAppId,
          application: { appId },
        }).then(({ apiRes }: any) => {
          expect(apiRes.status).to.not.eq(201)
          const body = JSON.stringify(apiRes.body)
          expect(body).to.match(/not found|Application/i)
        })
      })
    })
  })

  describe('multi-env reuse keeps Application until last consumer', () => {
    let appId = ''
    let devClientId = ''
    let testClientId = ''
    const labelDev = 'orphan-app-multienv-dev'
    const labelTest = 'orphan-app-multienv-test'

    it('issues the same Application on dev and test', () => {
      const flow = state.flows[FLOW_KEYS.apiKeyOnly]
      const dev = flow.envs.find((e) => e.name === 'dev')!
      const test = flow.envs.find((e) => e.name === 'test')!

      withIssuerToken(state.issuerSa, () => {
        issueConsumer(state.gatewayId, {
          environmentAppId: dev.environmentAppId,
          application: {
            name: `orphan-multienv-${Date.now()}`,
            description: 'Reused across envs',
          },
          labels: { 'issued-by': labelDev },
        }).then(({ apiRes }: any) => {
          expect(apiRes.status).to.eq(201)
          devClientId = apiRes.body.clientId
          appId = applicationAppIdFromClientId(
            devClientId,
            dev.environmentAppId
          )

          issueConsumer(state.gatewayId, {
            environmentAppId: test.environmentAppId,
            application: { appId },
            labels: { 'issued-by': labelTest },
          }).then(({ apiRes: testRes }: any) => {
            expect(testRes.status).to.eq(201)
            testClientId = testRes.body.clientId
          })
        })
      })
    })

    it('keeps Application after deleting only the dev consumer', () => {
      cy.logout()
      cy.clearLocalStorage({ log: true })
      cy.deleteAllCookies()
      cy.visit(login.path)
      cy.get('@apiowner').then(({ user }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
      })
      cy.activateGateway(state.gatewayId)
      cy.visit(consumers.path)
      cy.wait(1000)
      consumers.filterConsumerByTypeAndValue('Labels', 'issued-by', labelDev)
      cy.wait(1000)
      consumers.deleteConsumer(devClientId)
      cy.contains('This action cannot be undone').should('be.visible')
      cy.contains('Yes, Delete').click()
      cy.verifyToastMessage('Consumer deleted')

      const flow = state.flows[FLOW_KEYS.apiKeyOnly]
      const dev = flow.envs.find((e) => e.name === 'dev')!

      withIssuerToken(state.issuerSa, () => {
        // App still exists — can re-issue on dev with same appId
        issueConsumer(state.gatewayId, {
          environmentAppId: dev.environmentAppId,
          application: { appId },
          labels: { 'issued-by': labelDev },
        }).then(({ apiRes }: any) => {
          expect(apiRes.status).to.eq(201)
          // leave this re-issued consumer; last-consumer test will delete both
          devClientId = apiRes.body.clientId
        })
      })
    })

    it('deletes Application after the last consumer is removed', () => {
      // After previous test: re-issued dev consumer + original test consumer share appId
      cy.visit(consumers.path)
      cy.wait(1000)
      consumers.filterConsumerByTypeAndValue('Labels', 'issued-by', labelDev)
      cy.wait(1000)
      consumers.deleteConsumer(devClientId)
      cy.contains('This action cannot be undone').should('be.visible')
      cy.contains('Yes, Delete').click()
      cy.verifyToastMessage('Consumer deleted')

      cy.visit(consumers.path)
      cy.wait(1000)
      consumers.filterConsumerByTypeAndValue('Labels', 'issued-by', labelTest)
      cy.wait(1000)
      consumers.deleteConsumer(testClientId)
      cy.contains('This action cannot be undone').should('be.visible')
      cy.contains('Yes, Delete').click()
      cy.verifyToastMessage('Consumer deleted')

      const flow = state.flows[FLOW_KEYS.apiKeyOnly]
      const env = flow.envs.find((e) => e.name === 'dev')!
      withIssuerToken(state.issuerSa, () => {
        issueConsumer(state.gatewayId, {
          environmentAppId: env.environmentAppId,
          application: { appId },
        }).then(({ apiRes }: any) => {
          expect(apiRes.status).to.not.eq(201)
          const body = JSON.stringify(apiRes.body)
          expect(body).to.match(/not found|Application/i)
        })
      })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
