import { run } from './helpers'

describe('CSS callback acknowledgements and delivery failures', () => {
  for (const cssStatus of [200, 202, 204]) {
    it(`accepts mock CSS acknowledgement ${cssStatus}`, () => {
      run({ cssStatus, callback: true }).then((result) => {
        expect(result.callback.results[0]).include({ provider: 'css', status: 'applied' })
        expect(result.callbacks).have.length(1)
      })
    })
  }

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
})
