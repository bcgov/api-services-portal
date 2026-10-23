import {
  statusUrl,
  grantsUrl,
  submitUrl,
  submission,
  grant,
  run,
  problem,
} from './helpers'

describe('Partner discovery and environment access', () => {
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
})
