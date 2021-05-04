import fetch from 'node-fetch'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

describe("Hello", function() {

    const server = setupServer(
        rest.get('http://hello', (req, res, ctx) => {
            return res(ctx.json({ 
                message: "hello"
            }))
        })
    )

    // Enable API mocking before tests.
    beforeAll(() => server.listen())

    // Reset any runtime request handlers we may add during the tests.
    afterEach(() => server.resetHandlers())

    // Disable API mocking after the tests are done.
    afterAll(() => server.close())

    describe('saying hello', function () {
        it('it should say hello', async function () {
            const result = await fetch('http://hello').then(res => res.json())
            expect(result.message).toBe('hello')
        })
    })
})
