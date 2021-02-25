var kong = require('../../services/kong');

import { rest } from 'msw'
import { setupServer } from 'msw/node'

describe("Kong Service", function() {

    const server = setupServer(
        rest.post('https://kong-admin:8001/consumers', (req, res, ctx) => {
            return res(ctx.json({ 
                id: '000-01',
                username: 'username',
                custom_id: 'custom_id'
            }))
        }),
        rest.post('https://kong-admin:8001/consumers/:uuid/key-auth', (req, res, ctx) => {
            return res(ctx.json({ 
                key: 'API-KEY-000-01',
            }))
        }),
        rest.get('https://kong-admin:8001/consumers/:uuid/key-auth', (req, res, ctx) => {
            return res(ctx.json({data: [{ 
                id: 'KEY-AUTH-ID-001',
            }]}))
        }),
        rest.put('https://kong-admin:8001/consumers/:uuid/key-auth/KEY-AUTH-ID-001', (req, res, ctx) => {
            return res(ctx.json({ 
                key: 'API-KEY-000-02',
            }))
        }),
        rest.get('https://kong-admin:8001/consumers', (req, res, ctx) => {
            return res(ctx.json({data: [{ 
                id: 'CONSUMER-001',
            }]}))
        }),
    )

    // Enable API mocking before tests.
    beforeAll(() => server.listen())

    // Reset any runtime request handlers we may add during the tests.
    afterEach(() => server.resetHandlers())

    // Disable API mocking after the tests are done.
    afterAll(() => server.close())

    describe('kong createKongConsumer', function () {
        it('it should createKongConsumer', async function () {
            const result = await kong('https://kong-admin:8001').createKongConsumer('XXDDDSSSDD', '')
            expect(result.id).toBe('000-01')
        })
        it('it should error due to bad url', async function() {
            await expect(kong('https://kong-adminx:8001').createKongConsumer('XXDDDSSSDD', '')).rejects.toThrow()
        })
    })

    describe('kong addKeyAuthToConsumer', function () {
        it('it should be successful', async function () {
            const result = await kong('https://kong-admin:8001').addKeyAuthToConsumer('myConsumerUuid')
            expect(result.apiKey).toBe('API-KEY-000-01')
        })
    //     it('it should error due to bad url', async function() {
    //         await expect(kong('https://kong-adminx:8001').createKongConsumer('XXDDDSSSDD', '')).rejects.toThrow()
    //     })
    })

    describe('kong genKeyForConsumer', function () {
        it('it should be successful', async function () {
            const result = await kong('https://kong-admin:8001').genKeyForConsumer('myConsumerUuid')
            expect(result.apiKey).toBe('API-KEY-000-02')
        })
    //     it('it should error due to bad url', async function() {
    //         await expect(kong('https://kong-adminx:8001').createKongConsumer('XXDDDSSSDD', '')).rejects.toThrow()
    //     })
    })

    describe('kong getConsumersByNamespace', function () {
        it('it should be successful', async function () {
            const result = await kong('https://kong-admin:8001').getConsumersByNamespace('ns-123')
            expect(result.length).toBe(1)
        })
    //     it('it should error due to bad url', async function() {
    //         await expect(kong('https://kong-adminx:8001').createKongConsumer('XXDDDSSSDD', '')).rejects.toThrow()
    //     })
    })

    describe('kong getConsumerNamespace', function () {
        it('it should be successful', async function () {
            const result = await kong('https://kong-admin:8001').getConsumerNamespace({tags:['ns.abc']})
            expect(result).toBe('abc')
        })
    })

    describe('kong isKongConsumerNamespaced', function () {
        it('it should be namespaced', async function () {
            const result = await kong('https://kong-admin:8001').isKongConsumerNamespaced({tags:['ns.abc']})
            expect(result).toBe(true)
        })
        it('it should not be namespaced', async function () {
            const result = await kong('https://kong-admin:8001').isKongConsumerNamespaced({tags:[]})
            expect(result).toBe(false)
        })
    //     it('it should error due to bad url', async function() {
    //         await expect(kong('https://kong-adminx:8001').createKongConsumer('XXDDDSSSDD', '')).rejects.toThrow()
    //     })
    })

    describe('kong getKeyAuth', function () {
        it('it should be successful', async function () {
            const result = await kong('https://kong-admin:8001').getKeyAuth('consumerUuid')
            expect(result).toBe('KEY-AUTH-ID-001')
        })
    })

})
