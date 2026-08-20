import LoginPage from '../../pageObjects/login'
import ApplicationPage from '../../pageObjects/applications'
import MyAccessPage from '../../pageObjects/myAccess'
import ConsumersPage from '../../pageObjects/consumers'
import {
  FLOW_KEYS,
  SuiteState,
  issueConsumer,
  loadSuiteState,
  withIssuerToken,
} from './helpers'

/**
 * Ownerless issuer-created Applications must not appear in the developer
 * portal (myApplications uses filterByOwner). They should still show on
 * the gateway Consumers page for the API provider.
 *
 * Depends on 00-setup.cy.ts suite state.
 */
describe('24 Self-issuing credentials — My Access exclusion', () => {
  const login = new LoginPage()
  const applications = new ApplicationPage()
  const myAccess = new MyAccessPage()
  const consumers = new ConsumersPage()

  let state: SuiteState
  const appName = `my-access-exclusion-${Date.now()}`
  let clientId = ''

  before(() => {
    loadSuiteState().then((s) => {
      state = s
      expect(state.gatewayId, 'suite state from 00-setup').to.be.a('string')
    })
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    cy.fixture('apiowner').as('apiowner')
  })

  it('issues an ownerless credential via the issuer API', () => {
    const flow = state.flows[FLOW_KEYS.apiKeyOnly]
    const env = flow.envs.find((e) => e.name === 'dev')!

    withIssuerToken(state.issuerSa, () => {
      issueConsumer(state.gatewayId, {
        environmentAppId: env.environmentAppId,
        application: {
          name: appName,
          description: 'Must not appear in developer My Access',
        },
        labels: { 'issued-by': 'my-access-check' },
      }).then(({ apiRes }: any) => {
        expect(apiRes.status).to.eq(201)
        clientId = apiRes.body.clientId
        expect(clientId).to.be.a('string')
      })
    })
  })

  it('does not list the application for a developer on Applications', () => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload(true)
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
    cy.visit(applications.path)
    cy.wait(2000)
    cy.contains(appName).should('not.exist')
  })

  it('does not list the application on developer My Access', () => {
    cy.visit(myAccess.path)
    cy.wait(2000)
    cy.contains(appName).should('not.exist')
    cy.contains(clientId).should('not.exist')
  })

  it('shows the consumer on the API provider Consumers page', () => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
    cy.visit(login.path)
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
    cy.activateGateway(state.gatewayId)
    cy.visit(consumers.path)
    cy.wait(2000)
    consumers.filterConsumerByTypeAndValue(
      'Labels',
      'issued-by',
      'my-access-check'
    )
    cy.wait(1000)
    cy.get(consumers.allConsumerTable).contains(clientId).should('exist')
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
