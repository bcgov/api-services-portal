/// <reference types="cypress" />
export {}

const statusUrl = '/v1/integrations/integration'
const serversUrl = '/v1/resource-servers?environment=dev'
const grantsUrl = (environment = 'dev', status = 'approved') =>
  `/v1/integrations/integration/allowed-services?environment=${environment}&status=${status}`
const submitUrl = '/v1/integrations/integration/access-requests'
const submission = (environment = 'dev', service: Record<string, unknown> = {}) => ({
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
const grant = (environment: string, version = '1.0.0', scopes = ['read']) => [
  {
    id: 'claims',
    environment,
    services: [{ name: `claims-${environment}`, version, scopes }],
  },
]
const run = (input: unknown) => cy.task('cssContract', input) as Cypress.Chainable<any>
function problem(result: any, status: number, code: string) {
  expect(result.status).eq(status)
  expect(result.contentType).contain('application/problem+json')
  expect(result.body).include({ status, code })
  expect(result.body.type).match(/^https:\/\/errors\.sdx\.gov\.bc\.ca\//)
}

describe('all four partner APIs and CSS callback against HTTP mock services', () => {
  it('discovers registered and unregistered integrations', () => {
    run({ steps: [{ url: statusUrl }, { url: '/v1/integrations/unknown' }] }).then(
      (result) => {
        expect(result.results[0].status).eq(200)
        expect(result.results[0].body).include({
          status: 'registered',
          id: 'consumer',
          organization: 'org',
        })
        expect(result.results[1].status).eq(200)
        expect(result.results[1].body).deep.eq({ status: 'unregistered' })
      }
    )
  })

  for (const environment of ['dev', 'test']) {
    it(`discovers resource servers, submits access, approves and delivers only ${environment} grants`, () => {
      run({
        initial: 'empty',
        steps: [
          { url: `/v1/resource-servers?environment=${environment}` },
          { method: 'POST', url: submitUrl, body: submission(environment) },
          { url: grantsUrl(environment, 'pending') },
          { url: grantsUrl(environment), callback: true, environment },
          {
            approve: environment,
            url: grantsUrl(environment),
            callback: true,
            environment,
          },
        ],
      }).then((result) => {
        const [servers, submitted, pending, beforeApproval, approved] = result.results
        expect(servers.status).eq(200)
        expect(servers.body).have.length(1)
        expect(servers.body[0]).include({ id: 'claims', environment })
        expect(servers.body[0].services.map((s: any) => s.name)).deep.eq([
          `claims-${environment}`,
        ])
        expect(servers.body[0].services[0]).include({ version: '1.0.0' })
        expect(servers.body[0].services[0].scopes.map((s: any) => s.label)).deep.eq([
          'read',
          'write',
        ])
        expect(submitted.status).eq(200)
        expect(submitted.body.results[`claims-${environment}`]).eq(
          'submitted approval request'
        )
        expect(result.writes).have.length(1)
        expect(result.writes[0].requesterDetails.service.version).eq('1.0.0')
        expect(pending.body.resourceServers).deep.eq(grant(environment))
        expect(beforeApproval.body.resourceServers).deep.eq([])
        expect(approved.body.resourceServers).deep.eq(grant(environment))
        expect(approved.body.clientId).eq(`client-${environment}`)
        expect(approved.body.submissionId).eq(submitted.body.submissionId)
        expect(result.callbacks).have.length(2)
        expect(result.callbacks[0].body.resourceServers).deep.eq([])
        expect(result.callbacks[1]).deep.eq({
          method: 'PUT',
          path: '/requests/integration/sdx-allowed-access',
          body: approved.body,
        })
        expect(approved.callback.results).have.length(1)
        expect(approved.callback.results[0]).include({
          provider: 'css',
          status: 'applied',
        })
      })
    })
  }

  it('keeps both environment identities and callbacks independent in one store', () => {
    run({
      steps: [
        { url: grantsUrl('dev'), callback: true, environment: 'dev' },
        { url: grantsUrl('test'), callback: true, environment: 'test' },
      ],
    }).then((result) => {
      for (const [index, environment] of ['dev', 'test'].entries()) {
        expect(result.results[index].body.clientId).eq(`client-${environment}`)
        expect(result.callbacks[index].body.resourceServers).deep.eq(grant(environment))
      }
    })
  })

  it('returns no resource servers for an unmatched environment', () => {
    run({ url: '/v1/resource-servers?environment=prod' }).then((result) => {
      expect(result.status).eq(200)
      expect(result.body).deep.eq([])
    })
  })

  const endpoints = [
    { url: statusUrl },
    { url: serversUrl },
    { url: grantsUrl() },
    { method: 'POST', url: submitUrl, body: submission() },
  ]
  for (const endpoint of endpoints) {
    for (const [auth, status, code] of [
      [{ noToken: true }, 401, 'UNAUTHORIZED'],
      [{ invalidToken: 'invalid' }, 401, 'UNAUTHORIZED'],
      [{ claims: { exp: 1 } }, 401, 'UNAUTHORIZED'],
      [{ claims: { iss: 'wrong' } }, 401, 'UNAUTHORIZED'],
      [{ claims: { aud: 'wrong' } }, 401, 'UNAUTHORIZED'],
      [{ claims: { scope: 'other' } }, 403, 'FORBIDDEN'],
    ] as const) {
      it(`rejects ${JSON.stringify(auth)} on ${endpoint.url}`, () => {
        run({ ...endpoint, ...auth }).then((result) => {
          problem(result, status, code)
          expect(result.writes).deep.eq([])
          expect(result.callbacks).deep.eq([])
          expect(result.upstreamCalls).deep.eq([])
        })
      })
    }
    it(`maps SDX upstream failure to 502 on ${endpoint.url}`, () => {
      run({ steps: [{ mutate: { upstreamStatus: 503 }, ...endpoint }] }).then((result) =>
        problem(result, 502, 'BAD_GATEWAY')
      )
    })
  }

  for (const [url, status] of [
    ['/v1/resource-servers', 400],
    [grantsUrl('dev', 'invalid'), 400],
    ['/v1/integrations/integration/allowed-services?environment=dev', 400],
    [grantsUrl('prod'), 404],
    ['/v1/integrations/unknown/allowed-services?environment=dev&status=approved', 400],
  ] as const) {
    it(`returns ${status} for ${url}`, () =>
      run({ url }).then((result) =>
        problem(result, status, status === 404 ? 'NOT_FOUND' : 'BAD_REQUEST')
      ))
  }

  for (const [description, change, status] of [
    ['missing service', { name: 'missing-service' }, 502],
    ['stale version', { version: '0.9.0' }, 400],
    ['unknown scope', { scopes: ['admin'] }, 400],
    ['blank scope', { scopes: [' '] }, 400],
    ['blank version', { version: '' }, 400],
  ] as const) {
    it(`rejects ${description} on submission without writes`, () => {
      run({
        initial: 'empty',
        method: 'POST',
        url: submitUrl,
        body: submission('dev', change),
      }).then((result) => {
        problem(result, status, status === 502 ? 'BAD_GATEWAY' : 'BAD_REQUEST')
        expect(result.writes).deep.eq([])
        expect(result.callbacks).deep.eq([])
      })
    })
  }

  it('rejects malformed bodies and mismatched provider/environment without writes', () => {
    const provider = submission()
    provider.resourceServers[0].id = 'other-provider'
    const environment = submission()
    environment.resourceServers[0].environment = 'test'
    const policy = submission()
    policy.policyVersion = 'unknown'
    run({
      initial: 'empty',
      steps: [null, provider, environment, policy].map((body) => ({
        method: 'POST',
        url: submitUrl,
        body,
      })),
    }).then((result) => {
      result.results.forEach((response: any) => problem(response, 400, 'BAD_REQUEST'))
      expect(result.writes).deep.eq([])
    })
  })

  it('repeated submissions preserve one pending request and one approved grant', () => {
    run({
      initial: 'empty',
      steps: [
        { method: 'POST', url: submitUrl, body: submission() },
        { method: 'POST', url: submitUrl, body: submission() },
        { approve: 'dev', method: 'POST', url: submitUrl, body: submission() },
        { url: grantsUrl(), callback: true },
      ],
    }).then((result) => {
      expect(result.results[0].body.results['claims-dev']).eq(
        'submitted approval request'
      )
      expect(result.results[1].body.results['claims-dev']).eq('pending approval')
      expect(result.results[2].body.results['claims-dev']).eq('already approved')
      expect(result.writes).have.length(1)
      expect(result.connections).have.length(1)
      expect(result.callbacks).have.length(1)
      expect(result.callbacks[0].body.resourceServers).deep.eq(grant('dev'))
    })
  })

  for (const cssStatus of [200, 202, 204]) {
    it(`accepts mock CSS acknowledgement ${cssStatus}`, () => {
      run({ cssStatus, callback: true }).then((result) => {
        expect(result.callback.results[0]).include({ provider: 'css', status: 'applied' })
        expect(result.callbacks).have.length(1)
      })
    })
  }

  it('rejects an unknown integration on submission with 404', () => {
    run({
      method: 'POST',
      url: '/v1/integrations/unknown/access-requests',
      body: submission(),
    }).then((result) => problem(result, 404, 'NOT_FOUND'))
  })

  it('validates the entire submission before writing any connection', () => {
    const body = submission()
    body.resourceServers[0].services.push({
      name: 'missing',
      version: '1.0.0',
      scopes: ['read'],
    })
    run({ initial: 'empty', method: 'POST', url: submitUrl, body }).then((result) => {
      problem(result, 502, 'BAD_GATEWAY')
      expect(result.writes).deep.eq([])
    })
  })

  for (const [description, mutate, status, code] of [
    ['service removed', { remove: true }, 502, 'BAD_GATEWAY'],
    ['scope removed', { scopes: ['write'] }, 409, 'CONFLICT'],
    ['catalog version removed', { version: '' }, 409, 'CONFLICT'],
    ['provider changed', { providerId: 'other-provider' }, 409, 'CONFLICT'],
    ['environment changed', { environment: 'test' }, 400, 'BAD_REQUEST'],
    ['conflicting client identity', { duplicateClient: true }, 409, 'CONFLICT'],
  ] as const) {
    it(`blocks stale grants and callbacks when ${description} after submission`, () => {
      run({
        initial: 'empty',
        steps: [
          { method: 'POST', url: submitUrl, body: submission() },
          { approve: 'dev', mutate, url: grantsUrl(), callback: true },
        ],
      }).then((result) => {
        expect(result.results[0].status).eq(200)
        problem(result.results[1], status, code)
        expect(result.results[1].callback.error).include({ status, code })
        expect(result.callbacks).deep.eq([])
        expect(result.writes).have.length(1)
      })
    })
  }

  it('pins reviewed version and requires reapproval when resubmitting a new catalog version', () => {
    run({
      steps: [
        { mutate: { version: '2.0.0' }, url: grantsUrl(), callback: true },
        { method: 'POST', url: submitUrl, body: submission() },
        { method: 'POST', url: submitUrl, body: submission('dev', { version: '2.0.0' }) },
        { url: grantsUrl() },
        { approve: 'dev', url: grantsUrl(), callback: true },
      ],
    }).then((result) => {
      expect(result.results[0].body.resourceServers).deep.eq(grant('dev', '1.0.0'))
      expect(result.callbacks[0].body.resourceServers).deep.eq(grant('dev', '1.0.0'))
      problem(result.results[1], 400, 'BAD_REQUEST')
      expect(result.results[2].body.results['claims-dev']).eq(
        'updated version, submitted for re-approval'
      )
      expect(result.results[3].body.resourceServers).deep.eq([])
      expect(result.results[4].body.resourceServers).deep.eq(grant('dev', '2.0.0'))
    })
  })

  it('requires reapproval for scope changes and replaces CSS grants only after approval', () => {
    run({
      steps: [
        {
          method: 'POST',
          url: submitUrl,
          body: submission('dev', { scopes: ['write'] }),
        },
        { url: grantsUrl(), callback: true },
        { approve: 'dev', url: grantsUrl(), callback: true },
      ],
    }).then((result) => {
      expect(result.results[0].body.results['claims-dev']).eq(
        'updated scopes, submitted for re-approval'
      )
      expect(result.callbacks[0].body.resourceServers).deep.eq([])
      expect(result.callbacks[1].body.resourceServers).deep.eq(
        grant('dev', '1.0.0', ['write'])
      )
    })
  })

  it('does not grant a rejected or inactive connection', () => {
    run({
      steps: [
        { mutate: { approved: false, active: false }, url: grantsUrl(), callback: true },
        { mutate: { approved: true }, url: grantsUrl(), callback: true },
      ],
    }).then((result) => {
      expect(result.callbacks).have.length(2)
      result.callbacks.forEach((callback: any) =>
        expect(callback.body.resourceServers).deep.eq([])
      )
    })
  })

  for (const mutate of [{ cssStatus: 400 }, { cssStatus: 503 }, { disconnect: true }]) {
    it(`records CSS delivery failure without retry for ${JSON.stringify(mutate)}`, () => {
      run({ mutate, callback: true }).then((result) => {
        expect(result.callback.results[0]).include({ provider: 'css', status: 'failed' })
        expect(result.callback.results[0].details.message).eq(
          'common-sso provisionAllowedServices failed'
        )
        expect(result.callbacks).have.length(1)
      })
    })
  }

  it('documents only supported partner errors and accepts CSS 2xx acknowledgements', () => {
    run({ url: statusUrl, spec: true }).then((result) => {
      const paths = result.spec.paths
      for (const path of Object.values(paths) as any[]) {
        for (const method of ['get', 'post']) {
          if (!path[method]) continue
          for (const [status, response] of Object.entries(path[method].responses) as [
            string,
            any
          ][]) {
            if (status === '200') continue
            expect(Object.keys(response.content)).deep.eq(['application/problem+json'])
            expect(response.content['application/problem+json'].schema.$ref).eq(
              '#/components/schemas/Problem'
            )
          }
        }
      }
      expect(Object.keys(paths['/integrations/{integrationId}'].get.responses)).deep.eq([
        '200',
        '400',
        '401',
        '403',
        '500',
        '502',
      ])
      expect(Object.keys(paths['/resource-servers'].get.responses)).deep.eq([
        '200',
        '400',
        '401',
        '403',
        '500',
        '502',
      ])
      for (const [path, method] of [
        ['/integrations/{integrationId}/allowed-services', 'get'],
        ['/integrations/{integrationId}/access-requests', 'post'],
      ]) {
        expect(Object.keys(paths[path][method].responses)).deep.eq([
          '200',
          '400',
          '401',
          '403',
          '404',
          '409',
          '500',
          '502',
        ])
      }
      const callback =
        paths['/integrations/{integrationId}/access-requests'].post.callbacks
          .provisionAllowedServices
      expect(
        Object.keys(
          callback['/requests/{$request.params#/integrationId}/sdx-allowed-access'].put
            .responses
        )
      ).deep.eq(['2XX'])
    })
  })
})
