import { grantsUrl, submitUrl, submission, grant, run, problem } from './helpers'

describe('Post-submission changes and grant reapproval', () => {
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
})
