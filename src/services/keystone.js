const assert = require('assert').strict;

module.exports = {
    lookupServices: async function lookupServices (context, services) {
        const result = await context.executeGraphQL({
            query: `query GetServices($services: [ID]) {
                        allGatewayServices(where: {id_in: $services}) {
                                name
                                plugins {
                                    name
                                    config
                                }
                                routes {
                                    name
                                    plugins {
                                        name
                                        config
                                    }
                                }
                        }
                    }`,
            variables: { services: services },
        })
        console.log("lookupServices " + JSON.stringify(result))
        result.data.allGatewayServices.map(svc =>
            svc.plugins?.map(plugin => plugin.config = JSON.parse(plugin.config)))
        return result.data.allGatewayServices
    },

    lookupProductEnvironmentServices: async function lookupProductEnvironmentServices (context, id) {
        const result = await context.executeGraphQL({
            query: `query GetProductEnvironmentServices($id: ID!) {
                        allEnvironments(where: {id: $id}) {
                            id
                            name
                            flow
                            credentialIssuer {
                                flow
                                oidcDiscoveryUrl
                            }
                            services {
                                name
                                plugins {
                                    name
                                    config
                                }
                                routes {
                                    name
                                    plugins {
                                        name
                                        config
                                    }
                                }
                            }
                        }
                    }`,
            variables: { id: id },
        })
        console.log("lookupProductEnvironmentServices " + JSON.stringify(result))
        result.data.allEnvironments[0].services.map(svc =>
            svc.plugins?.map(plugin => plugin.config = JSON.parse(plugin.config)))
        return result.data.allEnvironments[0]
    },

    lookupCredentialReferenceByServiceAccess: async function lookupEnvironmentAndApplicationByAccessRequest (context, id) {
        const result = await context.executeGraphQL({
            query: `query GetSpecificServiceAccess($id: ID!) {
                        allServiceAccesses(where: {id: $id}) {
                            productEnvironment {
                                id
                                name
                                flow
                            }
                            consumer {
                                kongConsumerId
                            }
                            credentialReference
                        }
                    }`,
            variables: { id: id },
        })
        console.log("lookupCredentialReferenceByServiceAccess " + JSON.stringify(result))
        result.data.allServiceAccesses[0].credentialReference = JSON.parse(result.data.allServiceAccesses[0].credentialReference)
        return result.data.allServiceAccesses[0]
    },

    lookupEnvironmentAndApplicationByAccessRequest: async function lookupEnvironmentAndApplicationByAccessRequest (context, id) {
        const result = await context.executeGraphQL({
            query: `query GetSpecificEnvironment($id: ID!) {
                        allAccessRequests(where: {id: $id}) {
                            productEnvironment {
                                id
                                name
                                flow
                                credentialIssuer {
                                    id
                                }
                                product {
                                    namespace
                                }
                            }
                            application {
                                id
                                appId
                            }
                            controls
                        }
                    }`,
            variables: { id: id },
        })
        console.log("lookupEnvironmentAndApplicationByAccessRequest " + JSON.stringify(result))
        return result.data.allAccessRequests[0]
    },
    lookupKongConsumerIdByName: async function (context, name) {
        assert.strictEqual(name != null && typeof name != 'undefined' && name != "", true, "Invalid Consumer Username")
        const result = await context.executeGraphQL({
            query: `query FindConsumerByUsername($where: ConsumerWhereInput) {
                        allGatewayConsumers(where: $where) {
                            kongConsumerId
                        }
                    }`,
            variables: { where: { username: name } },
        })
        console.log("lookupKongConsumerIdByName [" + name+ "] " + JSON.stringify(result))
        assert.strictEqual(result.data.allGatewayConsumers.length, 1, "Unexpected data returned for Consumer lookup")
        return result.data.allGatewayConsumers[0].kongConsumerId
    }, 
    // lookupGatewayServiceIdByName: async function (context, name) {
    //     assert.strictEqual(name != null && typeof name != 'undefined' && name != "", true, "Invalid Service Name")
    //     const result = await context.executeGraphQL({
    //         query: `query FindGatewayServiceByName($where: GatewayServiceWhereInput) {
    //                     allGatewayServices(where: $where) {
    //                         kongServiceId
    //                     }
    //                 }`,
    //         variables: { where: { name: name } },
    //     })
    //     console.log("lookupGatewayServiceIdByName [" + name+ "] " + JSON.stringify(result))
    //     assert.strictEqual(result.data.allGatewayServices.length, 1, "Unexpected data returned for Gateway Service lookup")
    //     return result.data.allGatewayServices[0].kongServiceId
    // },    
    // lookupGatewayRouteIdByName: async function (context, name) {
    //     assert.strictEqual(name != null && typeof name != 'undefined' && name != "", true, "Invalid Route Name")
    //     const result = await context.executeGraphQL({
    //         query: `query FindGatewayRouteByName($where: GatewayRouteWhereInput) {
    //                     allGatewayServices(where: $where) {
    //                         kongServiceId
    //                     }
    //                 }`,
    //         variables: { where: { name: name } },
    //     })
    //     console.log("lookupGatewayServiceIdByName [" + name+ "] " + JSON.stringify(result))
    //     assert.strictEqual(result.data.allGatewayServices.length, 1, "Unexpected data returned for Gateway Service lookup")
    //     return result.data.allGatewayServices[0].kongServiceId
    // },
    lookupCredentialIssuerById: async function (context, id) {
        const result = await context.executeGraphQL({
            query: `query GetCredentialIssuerById($id: ID!) {
                        allCredentialIssuers(where: {id: $id}) {
                            name
                            flow
                            mode
                            oidcDiscoveryUrl
                            initialAccessToken
                            clientRegistration
                            clientId
                            clientSecret
                        }
                    }`,
            variables: { id: id },
        })
        console.log("lookupCredentialIssuerById " + JSON.stringify(result))
        return result.data.allCredentialIssuers[0]    
    },

    addKongConsumer: async function(context, username, kongConsumerId) {
        console.log("CALLING " + username + " " + kongConsumerId)

        // This should actually go away and the "Feeders" should be used
        const result = await context.executeGraphQL({
            query: `mutation CreateNewConsumer($username: String, $kongConsumerId: String) {
                        createGatewayConsumer(data: { username: $username, kongConsumerId: $kongConsumerId, tags: "[]" }) {
                            id
                            kongConsumerId
                        }
                    }`,
            variables: { username, kongConsumerId },
        })
        //{"data":{"createConsumer":{"id":"6004b65c2a7e02414bb3ccb5"}}}
        console.log("KEYSTONE CONSUMER " + JSON.stringify(result))
        return result.data.createGatewayConsumer.id        
    },

    addServiceAccess: async function(context, name, active, aclEnabled, consumerType, credentialReference, clientRoles, consumerPK, productEnvironment, application) {
        // This should actually go away and the "Feeders" should be used
        const data = { name, active, aclEnabled, consumerType, credentialReference }
        data.clientRoles = JSON.stringify(clientRoles)
        data.consumer = { connect: { id: consumerPK } }
        data.productEnvironment = { connect: { id: productEnvironment.id } }
        application != null && (data.application = { connect: { id: application.id } })

        console.log("KEYSTONE SERVICE ACCESS DATA " + JSON.stringify(data))

        const result = await context.executeGraphQL({
            query: `mutation CreateServiceAccess($data: ServiceAccessCreateInput) {
                        createServiceAccess(data: $data) {
                            id
                        }
                    }`,
            variables: { data },
        })
        //{"data":{"createConsumer":{"id":"6004b65c2a7e02414bb3ccb5"}}}
        console.log("KEYSTONE SERVICE ACCESS " + JSON.stringify(result))
        return result.data.createServiceAccess.id        
    },

    linkCredRefsToServiceAccess: async function (context, serviceAccessId, credentialReference) {
        const credRefAsString = JSON.stringify(credentialReference)
        const result = await context.executeGraphQL({
            query: `mutation UpdateConsumerInServiceAccess($serviceAccessId: ID!, $credRefAsString: String) {
                        updateServiceAccess(id: $serviceAccessId, data: { active: true, credentialReference: $credRefAsString } ) {
                            id
                        }
                    }`,
            variables: { serviceAccessId, credRefAsString },
        })
        console.log("FINISHED")
        console.log("UPDATE SERVICE ACCESS " + JSON.stringify(result,null, 4))
        return result.data.updateServiceAccess
    }
}
