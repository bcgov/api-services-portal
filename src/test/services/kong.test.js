var kong = require('../../services/kong');

//import setup from './workflow/setup';

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
                id: 'KEY-AUTH-1',
                key: 'API-KEY-000-01',
            }))
        }),
        rest.post('https://kong-admin:8001/consumers/:uuid/plugins', (req, res, ctx) => {
            return res(ctx.json({ 
                id: 'PLUGIN-1'
            }))
        }),
        rest.put('https://kong-admin:8001/consumers/:consumerPK/plugins/:pluginPK', (req, res, ctx) => {
            return res(ctx.json({ 
                key: 'PLUGIN-1',
            }))
        }),
        rest.get('https://kong-admin:8001/consumers/:uuid/key-auth', (req, res, ctx) => {
            return res(ctx.json({data: [{ 
                id: 'KEY-AUTH-ID-001',
            }]}))
        }),
        rest.put('https://kong-admin:8001/consumers/:consumerPK/key-auth/:keyAuthPK', (req, res, ctx) => {
            return res(ctx.json({ 
                key: 'API-KEY-000-02',
            }))
        }),
        rest.get('https://kong-admin:8001/consumers?ns=:ns', (req, res, ctx) => {
            return res(ctx.json({data: [{ 
                id: 'CONSUMER-001',
            },{ 
                id: 'CONSUMER-002',
            }]}))
        }),
        rest.get('https://kong-admin:8001/consumers', (req, res, ctx) => {
            return res(ctx.json({data: [{ 
                id: 'CONSUMER-001',
            }]}))
        }),
        rest.get('https://kong-admin:8001/consumers/:uuid/acls', (req, res, ctx) => {
            return res(ctx.json({data: [{ 
                id: 'ACL-1',
                group: 'GROUP-1',
            },{ 
                id: 'ACL-2',
                group: 'GROUP-2',
            }]}))
        }),
        rest.delete('https://kong-admin:8001/consumers/:uuid/acls/:acl', (req, res, ctx) => {
            return res(ctx.json({data: {}}))
        }),
        rest.post('https://kong-admin:8001/consumers/:uuid/acls', (req, res, ctx) => {
            return res(ctx.json({data: {id: "ACL-3"}}))
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
            expect(result.keyAuthPK).toBe('KEY-AUTH-1')
            expect(result.apiKey).toBe('API-KEY-000-01')
        })
    //     it('it should error due to bad url', async function() {
    //         await expect(kong('https://kong-adminx:8001').createKongConsumer('XXDDDSSSDD', '')).rejects.toThrow()
    //     })
    })

    describe('kong genKeyForConsumerKeyAuth', function () {
        it('it should be successful', async function () {
            const result = await kong('https://kong-admin:8001').genKeyForConsumerKeyAuth('myConsumerUuid', 'keyAuthUuid')
            expect(result.apiKey).toBe('API-KEY-000-02')
        })
    //     it('it should error due to bad url', async function() {
    //         await expect(kong('https://kong-adminx:8001').createKongConsumer('XXDDDSSSDD', '')).rejects.toThrow()
    //     })
    })

    describe('kong getConsumersByNamespace', function () {
        it('it should be successful', async function () {
            const result = await kong('https://kong-admin:8001').getConsumersByNamespace('ns-123')
            expect(result.length).toBe(2)
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

    // addPluginToConsumer
    describe('kong addPluginToConsumer', function () {
        it('it should be successful', async function () {
            const result = await kong('https://kong-admin:8001').addPluginToConsumer('myConsumerPK', { name: "rate-limiting", "config": {}})
            expect(result.id).toBe('PLUGIN-1')
        })
    })

    // updateConsumerPlugin
    describe('kong updateConsumerPlugin', function () {
        it('it should be successful', async function () {
            const result = await kong('https://kong-admin:8001').updateConsumerPlugin('myConsumerPK', 'PLUGIN-1', { name: "rate-limiting", "config": {}})
            expect(Object.keys(result).length).toBe(0)
        })
    })

    // getConsumerACLByNamespace
    describe('kong getConsumerACLByNamespace', function () {
        it('it should be successful', async function () {
            const result = await kong('https://kong-admin:8001').getConsumerACLByNamespace('myConsumerPK', 'ns-1')
            expect(result[0].group).toBe('GROUP-1')
            expect(result[1].group).toBe('GROUP-2')
        })
    })

    // updateConsumerACLByNamespace
    describe('kong updateConsumerACLByNamespace', function () {
        it('it should be successful', async function () {
            const result = await kong('https://kong-admin:8001').updateConsumerACLByNamespace('myConsumerPK', 'ns-1', ['GROUP-1', 'GROUP-3'])
            expect(result.C.length).toBe(1)
            expect(result.D.length).toBe(1)
            expect(result.C[0]).toBe('GROUP-3')
            expect(result.D[0]).toBe('GROUP-2')
        })
    })

})
