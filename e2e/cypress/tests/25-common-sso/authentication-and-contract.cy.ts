import {
  statusUrl,
  serversUrl,
  grantsUrl,
  submitUrl,
  submission,
  run,
  problem,
} from './helpers'

describe('Partner authentication, upstream errors and OpenAPI contract', () => {
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
