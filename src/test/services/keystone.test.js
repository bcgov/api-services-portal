import fetch from 'node-fetch'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import keystone from '../../services/keystone';

describe("KeystoneJS", function() {

    const context = {
        executeGraphQL: (q) => {
            if (q.query.indexOf('GetProductEnvironmentServices') != -1) {
                return {data: {allEnvironments: [ { name: 'ENV-NAME-1',
                    services: [
                        {
                            name: "SERVICE-1",
                            plugins: [
                                {
                                    name: "acl",
                                    config: '{}'
                                }
                            ],
                            routes: [
                                {
                                    name: "SERVICE-ROUTE-1",
                                    plugins: [
                                        {
                                            name: "rate-limiting",
                                            config: '{}'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                 } ] } }
            }
            if (q.query.indexOf('GetSpecificEnvironment') != -1) {
                return {data: {allAccessRequests: [ { credentialReference: "", application: { appId: "APP-01"}, productEnvironment: { name: 'ENV-NAME', credentialIssuer: { id: 'ISSUER-01'} }} ] } }
            }
            if (q.query.indexOf('FindConsumerByUsername') != -1) {
                return {data: {allGatewayConsumers: [ { kongConsumerId: 'CONSUMER-001' } ] } }
            }
            if (q.query.indexOf('GetCredentialIssuerById') != -1) {
                return {data: {allCredentialIssuers: [ { name: 'ISSUER-001' } ] } }
            }
            if (q.query.indexOf('CreateNewConsumer') != -1) {
                return {data: {createGatewayConsumer: { id: 'CONSUMER-001' } } }
            }
            if (q.query.indexOf('CreateServiceAccess') != -1) {
                return {data: {createServiceAccess: { id: 'SVC-ACCESS-002' } } }
            }
            if (q.query.indexOf('UpdateConsumerInServiceAccess') != -1) {
                return {data: {updateServiceAccess: { id: 'SVC-ACCESS-001' } } }
            }
        }  
    }

    describe('test lookupProductEnvironmentServices', function () {
        it('it should be successful', async function () {
            const result = await keystone.lookupProductEnvironmentServices(context, 'PROD-ENV-ID-1')
            expect(result.name).toBe('ENV-NAME-1')
            expect(result.services.length).toBe(1)
        })
    })

    describe('test lookupEnvironmentAndApplicationByAccessRequest', function () {
        it('it should be successful', async function () {
            const result = await keystone.lookupEnvironmentAndApplicationByAccessRequest(context, 'ENV-ID-1')
            expect(result.productEnvironment.name).toBe('ENV-NAME')
        })
    })

    describe('test lookupKongConsumerIdByName', function () {
        it('it should be successful', async function () {
            const result = await keystone.lookupKongConsumerIdByName(context, 'ENV-ID-1')
            expect(result).toBe('CONSUMER-001')
        })
    })

    describe('test lookupCredentialIssuerById', function () {
        it('it should be successful', async function () {
            const result = await keystone.lookupCredentialIssuerById(context, 'ID-1')
            expect(result.name).toBe('ISSUER-001')
        })
    })

    // addKongConsumer
    describe('test addKongConsumer', function () {
        it('it should be successful', async function () {
            const result = await keystone.addKongConsumer(context, 'USERNAME-1', 'CONSUMER-ID')
            expect(result).toBe('CONSUMER-001')
        })
    })

    // addServiceAccess
    describe('test addServiceAccess', function () {
        it('it should be successful', async function () {
            const result = await keystone.addServiceAccess(context, 'App8.Prod8.Env', true, true, 'client', null, null, null, { id: "PROD-ENV-01"}, null)
            expect(result).toBe('SVC-ACCESS-002')
        })
    })
    
    // linkCredRefsToServiceAccess
    describe('test linkCredRefsToServiceAccess', function () {
        it('it should be successful', async function () {
            const result = await keystone.linkCredRefsToServiceAccess(context, 'SVC-ACCESS-01', {apiKey:"sss"})
            expect(result.id).toBe('SVC-ACCESS-001')
        })
    })
})
