import { grantsUrl, submitUrl, submission, grant, run, problem } from './helpers'

describe('Access request submission and validation', () => {
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
})
