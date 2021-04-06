import fetch from 'node-fetch'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import YAML from 'yaml'

import tasked from '../../services/tasked'

describe("Tasked", function() {

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
            const tasks = new tasked('_tmp', 'C386A3F094034C9B9802A60399CA3805')
                .add('task1', async (ctx, v) => { return { answer: v}}, 'hi')
                .add('task2', async (ctx, v) => { return { answer: ctx.task1.out}}, 'goodbye')
                .add('task3', async () => true, 'hi')
            await tasks
                .start()
        })
    })
})
