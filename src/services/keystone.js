const assert = require('assert').strict;

const deleteRecords = async function (context, entity, where, multiple=false, returnedFields) {

    const qlName = entity.endsWith('s') ? `all${entity}es` : `all${entity}s`
    const find = await context.executeGraphQL({
        query: `query Find${entity}($where: ${entity}WhereInput) {
                    ${qlName}(where: $where ) {
                        id
                    }
                }`,
        variables: { where },
    })
    console.log(JSON.stringify(find, null, 4))
    if (find.data[qlName].length > 1) {
        if (multiple == false) {
            throw Error('Too many records returned!')
        }
        const ids = find.data[qlName].map(r => r.id)
        const qlDeleteName = entity.endsWith('s') ? `delete${entity}es` : `delete${entity}s`
        const result = await context.executeGraphQL({
            query: `mutation Delete${entity}($ids: [ID]!) {
                        ${qlDeleteName}( ids: $ids ) {
                            ${returnedFields.join(' ')}
                        }
                    }`,
            variables: { ids },
        })
        console.log("FINISHED DELETING IDS=" + ids + " FROM WHERE " + JSON.stringify(where))
        console.log("DELETED " + JSON.stringify(result,null, 4))
        return result.data[`${qlDeleteName}`]

    } else if (find.data[qlName].length == 0) {
        console.log("Already deleted")
        return null
    } else {
        const id = find.data[qlName][0].id
        const result = await context.executeGraphQL({
            query: `mutation Delete${entity}($id: ID!) {
                        delete${entity}( id: $id ) {
                            ${returnedFields.join(' ')}
                        }
                    }`,
            variables: { id },
        })
        console.log("FINISHED DELETING ID=" + id + " FROM WHERE " + JSON.stringify(where))
        console.log("DELETED " + JSON.stringify(result,null, 4))
        return result.data[`delete${entity}`]
    }
}

module.exports = {
    lookupApplication: async function lookupApplication (context, id) {
        const result = await context.executeGraphQL({
            query: `query GetApplicationById($id: ID!) {
                        allApplications(where: {id: $id}) {
                            id
                            appId
                        }
                    }`,
            variables: { id: id },
        })
        console.log("GetApplicationById " + JSON.stringify(result))
        return result.data.allApplications[0]
    },

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
                            appId
                            id
                            name
                            flow
                            product {
                                namespace
                            }
                            credentialIssuer {
                                id
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

    lookupCredentialReferenceByServiceAccess: async function lookupCredentialReferenceByServiceAccess (context, id) {
        const result = await context.executeGraphQL({
            query: `query GetSpecificServiceAccess($id: ID!) {
                        allServiceAccesses(where: {id: $id}) {
                            id
                            productEnvironment {
                                id
                                name
                                flow
                                credentialIssuer {
                                    id
                                }
                            }
                            consumer {
                                id
                                customId
                                extForeignKey
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
                            id
                            productEnvironment {
                                appId
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
                            serviceAccess {
                                id
                                consumer {
                                    id
                                    customId
                                    extForeignKey
                                }
                            }
                            controls
                        }
                    }`,
            variables: { id: id },
        })
        console.log("lookupEnvironmentAndApplicationByAccessRequest " + JSON.stringify(result))
        return result.data.allAccessRequests[0]
    },


    lookupConsumerPlugins: async function lookupConsumerPlugins (context, id) {
        const result = await context.executeGraphQL({
            query: `query GetConsumerPlugins($id: ID!) {
                        allGatewayConsumers(where: {id: $id}) {
                            id
                            username
                            aclGroups
                            customId
                            extForeignKey
                            namespace
                            plugins {
                              id
                              name
                              config
                              service {
                                id
                                name
                              }
                              route {
                                id
                                name
                              }
                            }
                            tags
                            createdAt
                      
                        }
                    }`,
            variables: { id: id },
        })
        console.log("GetConsumerPlugins " + JSON.stringify(result))
        return result.data.allGatewayConsumers[0]
    },

    lookupKongConsumerId: async function (context, id) {
        const result = await context.executeGraphQL({
            query: `query FindConsumerByUsername($where: GatewayConsumerWhereInput) {
                        allGatewayConsumers(where: $where) {
                            extForeignKey
                        }
                    }`,
            variables: { where: { id: id } },
        })
        console.log("lookupKongConsumerId [" + id+ "] " + JSON.stringify(result))
        assert.strictEqual(result.data.allGatewayConsumers.length, 1, "Unexpected data returned for Consumer lookup")
        return result.data.allGatewayConsumers[0].extForeignKey
    }, 

    lookupKongConsumerIdByName: async function (context, name) {
        assert.strictEqual(name != null && typeof name != 'undefined' && name != "", true, "Invalid Consumer Username")
        const result = await context.executeGraphQL({
            query: `query FindConsumerByUsername($where: GatewayConsumerWhereInput) {
                        allGatewayConsumers(where: $where) {
                            extForeignKey
                        }
                    }`,
            variables: { where: { username: name } },
        })
        console.log("lookupKongConsumerIdByName [" + name+ "] " + JSON.stringify(result))
        assert.strictEqual(result.data.allGatewayConsumers.length, 1, "Unexpected data returned for Consumer lookup")
        return result.data.allGatewayConsumers[0].extForeignKey
    }, 

    lookupKongConsumerByCustomId: async function (context, name) {
        assert.strictEqual(name != null && typeof name != 'undefined' && name != "", true, "Invalid Consumer CustomId")
        const result = await context.executeGraphQL({
            query: `query FindConsumerByUsername($where: GatewayConsumerWhereInput) {
                        allGatewayConsumers(where: $where) {
                            id
                            extForeignKey
                        }
                    }`,
            variables: { where: { customId: name } },
        })
        console.log("lookupKongConsumerIdByName [" + name+ "] " + JSON.stringify(result))
        assert.strictEqual(result.data.allGatewayConsumers.length, 1, "Unexpected data returned for Consumer lookup")
        return result.data.allGatewayConsumers[0]
    },     
    // lookupGatewayServiceIdByName: async function (context, name) {
    //     assert.strictEqual(name != null && typeof name != 'undefined' && name != "", true, "Invalid Service Name")
    //     const result = await context.executeGraphQL({
    //         query: `query FindGatewayServiceByName($where: GatewayServiceWhereInput) {
    //                     allGatewayServices(where: $where) {
    //                         extForeignKey
    //                     }
    //                 }`,
    //         variables: { where: { name: name } },
    //     })
    //     console.log("lookupGatewayServiceIdByName [" + name+ "] " + JSON.stringify(result))
    //     assert.strictEqual(result.data.allGatewayServices.length, 1, "Unexpected data returned for Gateway Service lookup")
    //     return result.data.allGatewayServices[0].extForeignKey
    // },    
    // lookupGatewayRouteIdByName: async function (context, name) {
    //     assert.strictEqual(name != null && typeof name != 'undefined' && name != "", true, "Invalid Route Name")
    //     const result = await context.executeGraphQL({
    //         query: `query FindGatewayRouteByName($where: GatewayRouteWhereInput) {
    //                     allGatewayServices(where: $where) {
    //                         extForeignKey
    //                     }
    //                 }`,
    //         variables: { where: { name: name } },
    //     })
    //     console.log("lookupGatewayServiceIdByName [" + name+ "] " + JSON.stringify(result))
    //     assert.strictEqual(result.data.allGatewayServices.length, 1, "Unexpected data returned for Gateway Service lookup")
    //     return result.data.allGatewayServices[0].extForeignKey
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

    addKongConsumer: async function(context, username, customId, extForeignKey) {
        console.log("CALLING " + username + " " + extForeignKey)

        // This should actually go away and the "Feeders" should be used
        const result = await context.executeGraphQL({
            query: `mutation CreateNewConsumer($username: String, $customId: String, $extForeignKey: String) {
                        createGatewayConsumer(data: { username: $username, customId: $customId, extForeignKey: $extForeignKey, extSource: "kong", extRecordHash: "00000", tags: "[]" }) {
                            id
                            extForeignKey
                        }
                    }`,
            variables: { username, customId, extForeignKey },
        })
        //{"data":{"createConsumer":{"id":"6004b65c2a7e02414bb3ccb5"}}}
        console.log("KEYSTONE CONSUMER " + JSON.stringify(result))
        return result.data.createGatewayConsumer.id        
    },

    addServiceAccess: async function(context, name, active, aclEnabled, consumerType, credentialReference, clientRoles, consumerPK, productEnvironment, application) {
        // This should actually go away and the "Feeders" should be used
        const data = { name, active, aclEnabled, consumerType }
        data.clientRoles = JSON.stringify(clientRoles == null ? []:clientRoles)
        data.consumer = { connect: { id: consumerPK } }
        data.productEnvironment = { connect: { id: productEnvironment.id } }
        application != null && (data.application = { connect: { id: application.id } })
        credentialReference != null && (data.credentialReference = JSON.stringify(credentialReference))

        console.log("KEYSTONE SERVICE ACCESS DATA " + JSON.stringify(data, null, 4))

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

    markActiveTheServiceAccess: async function (context, serviceAccessId) {
        const result = await context.executeGraphQL({
            query: `mutation UpdateConsumerInServiceAccess($serviceAccessId: ID!) {
                        updateServiceAccess(id: $serviceAccessId, data: { active: true } ) {
                            id
                        }
                    }`,
            variables: { serviceAccessId },
        })
        console.log("FINISHED")
        console.log("UPDATE SERVICE ACCESS TO ACTIVE " + JSON.stringify(result,null, 4))
        return result.data.updateServiceAccess
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
    },

    linkServiceAccessToRequest: async function (context, serviceAccessId, requestId) {
        const result = await context.executeGraphQL({
            query: `mutation LinkServiceAccessToRequest($serviceAccessId: ID!, $requestId: ID!) {
                        updateAccessRequest(id: $requestId, data: { serviceAccess: { connect: { id: $serviceAccessId } } } ) {
                            id
                        }
                    }`,
            variables: { serviceAccessId, requestId },
        })
        console.log("FINISHED LINKING " + serviceAccessId + " TO REQUEST " + requestId)
        console.log("UPDATE ACCESS REQUEST " + JSON.stringify(result,null, 4))
        assert.strictEqual('errors' in result, false, 'Error linking service access to request')
        return result.data.updateAccessRequest
    }, 

    deleteRecords: deleteRecords,
    deleteRecord: async function (context, entity, where, returnedFields) {
        return deleteRecords(context, entity, where, false, returnedFields)
    },
}
