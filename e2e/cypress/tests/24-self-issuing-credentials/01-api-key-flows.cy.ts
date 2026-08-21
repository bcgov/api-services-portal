import {
  FLOW_KEYS,
  SuiteState,
  applicationAppIdFromClientId,
  callProtectedApiKey,
  issueConsumer,
  loadSuiteState,
  regenerateConsumer,
  withIssuerToken,
} from './helpers'

/**
 * kong-api-key-only and kong-api-key-acl issuance, reuse, duplicate, regenerate, upstream use.
 * Depends on 00-setup.cy.ts having written fixtures/state/24-self-issue.json.
 */
describe('24 Self-issuing credentials — API key flows', () => {
  let state: SuiteState

  before(() => {
    loadSuiteState().then((s) => {
      state = s
    })
  })

  ;[FLOW_KEYS.apiKeyOnly, FLOW_KEYS.apiKeyAcl].forEach((flowKey) => {
    describe(flowKey, () => {
      let firstCredential: any
      let applicationAppId = ''
      let oldApiKey = ''

      it('issues a new credential (create application)', () => {
        const flow = state.flows[flowKey]
        const env = flow.envs.find((e) => e.name === 'dev')!

        withIssuerToken(state.issuerSa, () => {
          issueConsumer(state.gatewayId, {
            environmentAppId: env.environmentAppId,
            application: {
              name: `tenant-${flowKey}-a`,
              description: `Self-issued ${flowKey}`,
            },
            labels: {
              'issued-by': 'cypress-suite-24',
              flow: flowKey,
            },
          }).then(({ apiRes }: any) => {
            expect(apiRes.status).to.eq(201)
            expect(apiRes.body.flow).to.eq(flow.flow)
            expect(apiRes.body.clientId).to.be.a('string')
            expect(apiRes.body.apiKey).to.be.a('string')
            expect(apiRes.body.clientId).to.match(
              new RegExp(`^${env.environmentAppId}-`)
            )

            firstCredential = apiRes.body
            oldApiKey = apiRes.body.apiKey
            applicationAppId = applicationAppIdFromClientId(
              apiRes.body.clientId,
              env.environmentAppId
            )
          })
        })
      })

      it('uses the issued API key against the protected upstream', () => {
        const flow = state.flows[flowKey]
        const env = flow.envs.find((e) => e.name === 'dev')!
        callProtectedApiKey(env.serviceName, firstCredential.apiKey).then(
          (res) => {
            expect(res.status).to.eq(200)
          }
        )
      })

      it('reuses the application on a second environment', () => {
        const flow = state.flows[flowKey]
        const env = flow.envs.find((e) => e.name === 'test')!

        withIssuerToken(state.issuerSa, () => {
          issueConsumer(state.gatewayId, {
            environmentAppId: env.environmentAppId,
            application: {
              appId: applicationAppId,
            },
            labels: {
              'issued-by': 'cypress-suite-24',
            },
          }).then(({ apiRes }: any) => {
            expect(apiRes.status).to.eq(201)
            expect(apiRes.body.clientId).to.eq(
              `${env.environmentAppId}-${applicationAppId}`
            )
            expect(apiRes.body.apiKey).to.be.a('string')
          })
        })
      })

      it('rejects duplicate access for the same environment + application', () => {
        const flow = state.flows[flowKey]
        const env = flow.envs.find((e) => e.name === 'dev')!

        withIssuerToken(state.issuerSa, () => {
          issueConsumer(state.gatewayId, {
            environmentAppId: env.environmentAppId,
            application: {
              appId: applicationAppId,
            },
          }).then(({ apiRes }: any) => {
            expect(apiRes.status).to.be.oneOf([400, 422, 500])
            const bodyText = JSON.stringify(apiRes.body)
            expect(bodyText).to.match(/already has access/i)
          })
        })
      })

      it('regenerates the credential in place', () => {
        withIssuerToken(state.issuerSa, () => {
          regenerateConsumer(state.gatewayId, firstCredential.clientId).then(
            ({ apiRes }: any) => {
              expect(apiRes.status).to.eq(200)
              expect(apiRes.body.clientId).to.eq(firstCredential.clientId)
              expect(apiRes.body.apiKey).to.be.a('string')
              expect(apiRes.body.apiKey).to.not.eq(oldApiKey)

              const flow = state.flows[flowKey]
              const env = flow.envs.find((e) => e.name === 'dev')!

              callProtectedApiKey(env.serviceName, oldApiKey).then((oldRes) => {
                expect(oldRes.status).to.be.oneOf([401, 403])
              })
              callProtectedApiKey(env.serviceName, apiRes.body.apiKey).then(
                (newRes) => {
                  expect(newRes.status).to.eq(200)
                }
              )
            }
          )
        })
      })
    })
  })
})
