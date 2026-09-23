import ActivityPage from '../../pageObjects/activity'
import LoginPage from '../../pageObjects/login'
import {
  FLOW_KEYS,
  SuiteState,
  applicationAppIdFromClientId,
  issueConsumer,
  loadSuiteState,
  regenerateConsumer,
  useBearerToken,
  withIssuerToken,
} from './helpers'

/**
 * Activity feed entries for self-issued and regenerated credentials.
 * Depends only on 00-setup.cy.ts (apiKeyOnly dev environment; no Kong republish).
 */
describe('24 Self-issuing credentials — activity', () => {
  const login = new LoginPage()
  const activityPage = new ActivityPage()

  let state: SuiteState
  const appName = `activity-tenant-${Date.now()}`
  let clientId = ''
  let apiKey = ''
  let regeneratedApiKey = ''
  let issuedCount = 0
  let regeneratedCount = 0
  let ownerToken = ''

  const issueTemplate =
    '{actor} {action} {entity} for {application} ({consumer}) to access {product} {environment}'
  const regenerateTemplate =
    '{actor} {action} {entity} for {application} ({consumer}) ({product} {environment})'

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

  function devEnvironment() {
    const flow = state.flows[FLOW_KEYS.apiKeyOnly]
    const env = flow.envs.find((e) => e.name === 'dev')
    expect(env, 'apiKeyOnly dev environment').to.exist
    return { flow, env: env! }
  }

  function issueBody() {
    const { env } = devEnvironment()
    return {
      environmentAppId: env.environmentAppId,
      application: {
        name: appName,
        description: 'Activity feed credential',
      },
    }
  }

  function entriesFor(body: any[], action: string) {
    return (body || []).filter(
      (entry) =>
        entry?.result === 'success' &&
        entry?.params?.action === action &&
        entry?.params?.entity === 'credential' &&
        entry?.params?.consumer === clientId
    )
  }

  function fetchActivity(): Cypress.Chainable<any[]> {
    useBearerToken(ownerToken)
    return cy
      .callAPI(
        `ds/api/v3/gateways/${state.gatewayId}/activity?first=100`,
        'GET'
      )
      .then(({ apiRes }: any) => {
        expect(apiRes.status, 'activity status').to.eq(200)
        expect(apiRes.body, 'activity body').to.be.an('array')
        return apiRes.body as any[]
      })
  }

  function openActivityPage() {
    cy.activateGateway(state.gatewayId)
    cy.visit(activityPage.path)
  }

  it('issues a credential on the api key only dev environment', () => {
    withIssuerToken(state.issuerSa, () => {
      issueConsumer(state.gatewayId, issueBody()).then(({ apiRes }: any) => {
        expect(apiRes.status).to.eq(201)
        clientId = apiRes.body.clientId
        apiKey = apiRes.body.apiKey
        expect(clientId).to.be.a('string')
        expect(apiKey).to.be.a('string')
      })
    })
  })

  it('logs in as Janis and reads activity with her session', () => {
    cy.visit(login.path)
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
    cy.activateGateway(state.gatewayId)
    cy.getUserSession().then(() => {
      cy.get('@login').then((xhr: any) => {
        ownerToken = xhr.headers['x-auth-request-access-token']
        expect(ownerToken, 'owner session token').to.be.a('string')
      })
    })
  })

  it('records an issued activity entry without the api key', () => {
    const { flow } = devEnvironment()
    fetchActivity().then((body) => {
      const matches = entriesFor(body, 'issued')
      expect(matches, 'issued entries for client').to.have.length(1)
      const entry = matches[0]
      expect(entry.message).to.eq(issueTemplate)
      expect(entry.params).to.include({
        action: 'issued',
        entity: 'credential',
        application: appName,
        consumer: clientId,
        product: flow.productName,
        environment: 'dev',
      })
      issuedCount = matches.length
      expect(entry.params.actor).to.be.oneOf([
        `service-account-${state.issuerSa.clientId}`,
        state.issuerSa.clientId,
      ])
      expect(JSON.stringify(body)).to.not.contain(apiKey)
      issuedCount = matches.length
    })
  })

  it('shows the issued credential on the Activity page', () => {
    openActivityPage()
    cy.contains('p', `issued credential for ${appName}`).should(
      'contain.text',
      clientId
    )
    activityPage.setFilterCondition('Consumer', clientId)
    cy.contains('p', `issued credential for ${appName}`).should(
      'contain.text',
      clientId
    )
  })

  it('does not record another issued entry when the same application is rejected', () => {
    const { env } = devEnvironment()
    // Same environment and application id, so issuance is rejected as duplicate access.
    withIssuerToken(state.issuerSa, () => {
      issueConsumer(state.gatewayId, {
        environmentAppId: env.environmentAppId,
        application: {
          appId: applicationAppIdFromClientId(clientId, env.environmentAppId),
        },
      }).then(({ apiRes }: any) => {
        expect(apiRes.status).to.not.eq(201)
      })
    })

    fetchActivity().then((body) => {
      expect(entriesFor(body, 'issued')).to.have.length(issuedCount)
    })
  })

  it('regenerates the credential', () => {
    withIssuerToken(state.issuerSa, () => {
      regenerateConsumer(state.gatewayId, clientId).then(({ apiRes }: any) => {
        expect(apiRes.status).to.eq(200)
        expect(apiRes.body.apiKey).to.be.a('string')
        expect(apiRes.body.apiKey).to.not.eq(apiKey)
        regeneratedApiKey = apiRes.body.apiKey
      })
    })
  })

  it('records a regenerated activity entry without the new api key', () => {
    const { flow } = devEnvironment()
    fetchActivity().then((body) => {
      const matches = entriesFor(body, 'regenerated')
      expect(matches, 'regenerated entries for client').to.have.length(1)
      const entry = matches[0]
      expect(entry.message).to.eq(regenerateTemplate)
      expect(entry.params).to.include({
        action: 'regenerated',
        entity: 'credential',
        application: appName,
        consumer: clientId,
        product: flow.productName,
        environment: 'dev',
      })
      const serialized = JSON.stringify(body)
      expect(serialized).to.not.contain(apiKey)
      expect(serialized).to.not.contain(regeneratedApiKey)
      regeneratedCount = matches.length
    })
  })

  it('shows the regenerated credential on the Activity page', () => {
    openActivityPage()
    cy.contains('p', 'regenerated credential').should('contain.text', clientId)
  })

  it('does not record another regenerated entry when regenerate is forbidden', () => {
    withIssuerToken(state.controlSa, () => {
      regenerateConsumer(state.gatewayId, clientId).then(({ apiRes }: any) => {
        expect(apiRes.status).to.eq(403)
      })
    })

    fetchActivity().then((body) => {
      expect(entriesFor(body, 'regenerated')).to.have.length(regeneratedCount)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
