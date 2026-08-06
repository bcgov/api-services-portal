import {
  FLOW_KEYS,
  SuiteState,
  applicationAppIdFromClientId,
  callProtectedBearer,
  getClientCredentialsToken,
  getTokenUsingPrivateKey,
  issueConsumer,
  loadSuiteState,
  regenerateConsumer,
  withIssuerToken,
} from './helpers'

const jose = require('node-jose')

/**
 * client-credentials authenticators: client-secret, client-jwt, client-jwt-jwks-url.
 * Depends on 00-setup.cy.ts suite state.
 *
 * Note: REST regenerate is not supported for client-jwt-jwks-url (server throws);
 * that case is skipped intentionally.
 */
describe('24 Self-issuing credentials — client-credentials flows', () => {
  let state: SuiteState

  before(() => {
    loadSuiteState().then((s) => {
      state = s
    })
  })

  describe('client-secret', () => {
    const flowKey = FLOW_KEYS.clientSecret
    let firstCredential: any
    let applicationAppId = ''
    let oldSecret = ''

    it('issues a client-secret credential', () => {
      const flow = state.flows[flowKey]
      const env = flow.envs.find((e) => e.name === 'dev')!

      withIssuerToken(state.issuerSa, () => {
        issueConsumer(state.gatewayId, {
          environmentAppId: env.environmentAppId,
          application: {
            name: `tenant-${flowKey}-a`,
            description: 'Self-issued client-secret',
          },
          labels: { 'issued-by': 'cypress-suite-24' },
        }).then(({ apiRes }: any) => {
          expect(apiRes.status).to.eq(201)
          expect(apiRes.body.flow).to.eq('client-credentials')
          expect(apiRes.body.clientId).to.be.a('string')
          expect(apiRes.body.clientSecret).to.be.a('string')
          expect(apiRes.body.tokenEndpoint).to.be.a('string')

          firstCredential = apiRes.body
          oldSecret = apiRes.body.clientSecret
          applicationAppId = applicationAppIdFromClientId(
            apiRes.body.clientId,
            env.environmentAppId
          )
        })
      })
    })

    it('exchanges client credentials and calls the upstream', () => {
      const flow = state.flows[flowKey]
      const env = flow.envs.find((e) => e.name === 'dev')!

      getClientCredentialsToken(
        firstCredential.clientId,
        firstCredential.clientSecret
      ).then((accessToken) => {
        callProtectedBearer(env.serviceName, accessToken).then((res) => {
          expect(res.status).to.eq(200)
        })
      })
    })

    it('reuses the application on the second environment', () => {
      const flow = state.flows[flowKey]
      const env = flow.envs.find((e) => e.name === 'test')!

      withIssuerToken(state.issuerSa, () => {
        issueConsumer(state.gatewayId, {
          environmentAppId: env.environmentAppId,
          application: { appId: applicationAppId },
        }).then(({ apiRes }: any) => {
          expect(apiRes.status).to.eq(201)
          expect(apiRes.body.clientId).to.eq(
            `${env.environmentAppId}-${applicationAppId}`
          )
          expect(apiRes.body.clientSecret).to.be.a('string')
        })
      })
    })

    it('rejects duplicate environment access', () => {
      const flow = state.flows[flowKey]
      const env = flow.envs.find((e) => e.name === 'dev')!

      withIssuerToken(state.issuerSa, () => {
        issueConsumer(state.gatewayId, {
          environmentAppId: env.environmentAppId,
          application: { appId: applicationAppId },
        }).then(({ apiRes }: any) => {
          expect(apiRes.status).to.be.oneOf([400, 422, 500])
          expect(JSON.stringify(apiRes.body)).to.match(/already has access/i)
        })
      })
    })

    it('regenerates the client secret', () => {
      withIssuerToken(state.issuerSa, () => {
        regenerateConsumer(state.gatewayId, firstCredential.clientId).then(
          ({ apiRes }: any) => {
            expect(apiRes.status).to.eq(200)
            expect(apiRes.body.clientId).to.eq(firstCredential.clientId)
            expect(apiRes.body.clientSecret).to.be.a('string')
            expect(apiRes.body.clientSecret).to.not.eq(oldSecret)

            const flow = state.flows[flowKey]
            const env = flow.envs.find((e) => e.name === 'dev')!

            cy.request({
              method: 'POST',
              url: Cypress.env('TOKEN_URL'),
              form: true,
              failOnStatusCode: false,
              body: {
                grant_type: 'client_credentials',
                scope: 'openid',
                client_id: firstCredential.clientId,
                client_secret: oldSecret,
              },
            }).then((oldTok) => {
              expect(oldTok.status).to.eq(401)
            })

            getClientCredentialsToken(
              firstCredential.clientId,
              apiRes.body.clientSecret
            ).then((accessToken) => {
              callProtectedBearer(env.serviceName, accessToken).then((res) => {
                expect(res.status).to.eq(200)
              })
            })
          }
        )
      })
    })
  })

  describe('client-jwt (generated key pair)', () => {
    const flowKey = FLOW_KEYS.clientJwt
    let firstCredential: any
    let applicationAppId = ''
    let oldPrivateKey = ''

    it('issues a client-jwt credential with generated keys', () => {
      const flow = state.flows[flowKey]
      const env = flow.envs.find((e) => e.name === 'dev')!

      withIssuerToken(state.issuerSa, () => {
        issueConsumer(state.gatewayId, {
          environmentAppId: env.environmentAppId,
          application: {
            name: `tenant-${flowKey}-a`,
            description: 'Self-issued client-jwt',
          },
          controls: {
            clientGenCertificate: true,
          },
          labels: { 'issued-by': 'cypress-suite-24' },
        }).then(({ apiRes }: any) => {
          expect(apiRes.status).to.eq(201)
          expect(apiRes.body.clientId).to.be.a('string')
          expect(apiRes.body.clientPrivateKey).to.be.a('string')
          expect(apiRes.body.clientPublicKey).to.be.a('string')
          expect(apiRes.body.tokenEndpoint).to.be.a('string')
          expect(apiRes.body.issuer).to.be.a('string')

          firstCredential = apiRes.body
          oldPrivateKey = apiRes.body.clientPrivateKey
          applicationAppId = applicationAppIdFromClientId(
            apiRes.body.clientId,
            env.environmentAppId
          )
        })
      })
    })

    it('obtains a token with the private key and calls the upstream', () => {
      const flow = state.flows[flowKey]
      const env = flow.envs.find((e) => e.name === 'dev')!

      getTokenUsingPrivateKey(
        firstCredential.clientId,
        firstCredential.tokenEndpoint,
        firstCredential.clientPrivateKey
      ).then((accessToken) => {
        callProtectedBearer(env.serviceName, accessToken).then((res) => {
          expect(res.status).to.eq(200)
        })
      })
    })

    it('reuses the application on the second environment', () => {
      const flow = state.flows[flowKey]
      const env = flow.envs.find((e) => e.name === 'test')!

      withIssuerToken(state.issuerSa, () => {
        issueConsumer(state.gatewayId, {
          environmentAppId: env.environmentAppId,
          application: { appId: applicationAppId },
          controls: { clientGenCertificate: true },
        }).then(({ apiRes }: any) => {
          expect(apiRes.status).to.eq(201)
          expect(apiRes.body.clientId).to.eq(
            `${env.environmentAppId}-${applicationAppId}`
          )
        })
      })
    })

    it('rejects duplicate environment access', () => {
      const flow = state.flows[flowKey]
      const env = flow.envs.find((e) => e.name === 'dev')!

      withIssuerToken(state.issuerSa, () => {
        issueConsumer(state.gatewayId, {
          environmentAppId: env.environmentAppId,
          application: { appId: applicationAppId },
          controls: { clientGenCertificate: true },
        }).then(({ apiRes }: any) => {
          expect(apiRes.status).to.be.oneOf([400, 422, 500])
          expect(JSON.stringify(apiRes.body)).to.match(/already has access/i)
        })
      })
    })

    it('regenerates JWT key material', () => {
      withIssuerToken(state.issuerSa, () => {
        regenerateConsumer(state.gatewayId, firstCredential.clientId).then(
          ({ apiRes }: any) => {
            expect(
              apiRes.status,
              `regenerate jwt: ${JSON.stringify(apiRes.body)}`
            ).to.eq(200)
            expect(apiRes.body.clientId).to.eq(firstCredential.clientId)
            expect(apiRes.body.clientPrivateKey).to.be.a('string')
            expect(apiRes.body.clientPrivateKey).to.not.eq(oldPrivateKey)

            const flow = state.flows[flowKey]
            const env = flow.envs.find((e) => e.name === 'dev')!

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const njwt = require('njwt')
            const now = Math.floor(Date.now() / 1000)
            const badJwt = njwt
              .create({ aud: Cypress.env('OIDC_ISSUER') }, oldPrivateKey, 'RS256')
              .setIssuedAt(now)
              .setExpiration(new Date((now + 300) * 1000))
              .setIssuer(firstCredential.clientId)
              .setSubject(firstCredential.clientId)
              .compact()

            cy.request({
              url: firstCredential.tokenEndpoint,
              method: 'POST',
              form: true,
              failOnStatusCode: false,
              body: {
                grant_type: 'client_credentials',
                client_id: firstCredential.clientId,
                client_assertion_type:
                  'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                client_assertion: badJwt,
              },
            }).then((oldTok) => {
              expect(oldTok.status).to.be.oneOf([400, 401])
            })

            getTokenUsingPrivateKey(
              firstCredential.clientId,
              apiRes.body.tokenEndpoint || firstCredential.tokenEndpoint,
              apiRes.body.clientPrivateKey
            ).then((accessToken) => {
              callProtectedBearer(env.serviceName, accessToken).then((res) => {
                expect(res.status).to.eq(200)
              })
            })
          }
        )
      })
    })
  })

  describe('client-jwt-jwks-url', () => {
    const flowKey = FLOW_KEYS.clientJwks
    let firstCredential: any
    let applicationAppId = ''
    let privateKeyPem = ''
    let publicKeyPem = ''

    it('issues a credential using clientCertificate controls', () => {
      const flow = state.flows[flowKey]
      const env = flow.envs.find((e) => e.name === 'dev')!

      cy.generateKeyPair()
      cy.readFile('cypress/fixtures/state/jwtReGenPrivateKey_new.pem').then(
        (priv) => {
          privateKeyPem = priv
          cy.readFile('cypress/fixtures/state/jwtReGenPublicKey_new.pub').then(
            (pub) => {
              publicKeyPem = pub

              withIssuerToken(state.issuerSa, () => {
                issueConsumer(state.gatewayId, {
                  environmentAppId: env.environmentAppId,
                  application: {
                    name: `tenant-${flowKey}-cert`,
                    description: 'Self-issued jwks authenticator via cert',
                  },
                  controls: {
                    clientCertificate: publicKeyPem,
                  },
                  labels: { 'issued-by': 'cypress-suite-24' },
                }).then(({ apiRes }: any) => {
                  expect(apiRes.status).to.eq(201)
                  expect(apiRes.body.clientId).to.be.a('string')
                  expect(apiRes.body.tokenEndpoint).to.be.a('string')
                  expect(apiRes.body.issuer).to.be.a('string')
                  expect(apiRes.body.clientPrivateKey).to.not.exist

                  firstCredential = apiRes.body
                  applicationAppId = applicationAppIdFromClientId(
                    apiRes.body.clientId,
                    env.environmentAppId
                  )
                })
              })
            }
          )
        }
      )
    })

    it('obtains a token with the supplied certificate key and calls the upstream', () => {
      const flow = state.flows[flowKey]
      const env = flow.envs.find((e) => e.name === 'dev')!

      getTokenUsingPrivateKey(
        firstCredential.clientId,
        firstCredential.tokenEndpoint,
        privateKeyPem,
        firstCredential.issuer
      ).then((accessToken) => {
        callProtectedBearer(env.serviceName, accessToken).then((res) => {
          expect(res.status).to.eq(200)
        })
      })
    })

    it('also accepts jwksUrl controls when issuing', () => {
      const flow = state.flows[flowKey]
      const env = flow.envs.find((e) => e.name === 'test')!

      cy.generateKeystore().then((keystoreJson: any) => {
        const parsed =
          typeof keystoreJson === 'string'
            ? JSON.parse(keystoreJson)
            : keystoreJson
        return jose.JWK.asKeyStore(parsed).then((keyStore: any) => {
          return cy
            .request({
              url: Cypress.env('JWKS_URL'),
              method: 'POST',
              body: keyStore.toJSON(),
              form: true,
              failOnStatusCode: false,
            })
            .then((jwksRes) => {
              expect(jwksRes.status).to.eq(200)

              withIssuerToken(state.issuerSa, () => {
                issueConsumer(state.gatewayId, {
                  environmentAppId: env.environmentAppId,
                  application: {
                    name: `tenant-${flowKey}-jwks`,
                    description: 'Self-issued via jwksUrl',
                  },
                  controls: {
                    jwksUrl: Cypress.env('JWKS_URL'),
                  },
                }).then(({ apiRes }: any) => {
                  expect(apiRes.status).to.eq(201)
                  expect(apiRes.body.clientId).to.be.a('string')
                  expect(apiRes.body.tokenEndpoint).to.be.a('string')
                  expect(apiRes.body.issuer).to.be.a('string')
                })
              })
            })
        })
      })
    })

    it('rejects duplicate environment access', () => {
      const flow = state.flows[flowKey]
      const env = flow.envs.find((e) => e.name === 'dev')!

      withIssuerToken(state.issuerSa, () => {
        issueConsumer(state.gatewayId, {
          environmentAppId: env.environmentAppId,
          application: { appId: applicationAppId },
          controls: { clientCertificate: publicKeyPem },
        }).then(({ apiRes }: any) => {
          expect(apiRes.status).to.be.oneOf([400, 422, 500])
          expect(JSON.stringify(apiRes.body)).to.match(/already has access/i)
        })
      })
    })

    it('skips regenerate for jwks-url (not supported by API)', () => {
      cy.log(
        'Regenerate is intentionally unsupported for client-jwt-jwks-url; covered for other flows.'
      )
    })
  })
})
