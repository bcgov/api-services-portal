import fetch from 'node-fetch'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import YAML from 'yaml'

import { UMAPolicyService, Policy } from '../../services/uma2'

describe("Tasked", function() {

    const server = setupServer(
        rest.get('http://uma2authserver/authz/protection/uma-policy', (req, res, ctx) => {
            return res(ctx.json([
                { name: "policy-1", scopes: [ 'Namespace.Create' ] , clients: [ 'cid-1']} as Policy
            ]))
        })
    )

    // Enable API mocking before tests.
    beforeAll(() => server.listen())

    // Reset any runtime request handlers we may add during the tests.
    afterEach(() => server.resetHandlers())

    // Disable API mocking after the tests are done.
    afterAll(() => server.close())

    describe('uma2 policies', function () {
        it('it should return a good list', async function () {
            const result = await new UMAPolicyService( 'http://uma2authserver', 'fake token').listPolicies({})
            expect (result.length).toBe(1)
            expect (result[0].name).toBe('policy-1')
        })
    })
})
