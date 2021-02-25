
module.exports = {
    lookupEnvironmentAndApplicationByAccessRequest: async function lookupEnvironment (context, id) {
        return await context.executeGraphQL({
            query: `query GetSpecificEnvironment($id: ID!) {
                        allAccessRequests(id: $id) {
                            productEnvironment {
                                name
                                credentialIssuer {
                                    id
                                }
                            }
                            application {
                                appId
                            }
                            credentialReference
                        }
                    }`,
            variables: { id: id },
        }).data.allAccessRequests[0]
    },
    lookupKongConsumerIdByName: async function (context, name) {
        return await context.executeGraphQL({
            query: `query FindConsumerByUsername($where: ConsumerWhereInput) {
                        allConsumers(where: $where) {
                            kongConsumerId
                        }
                    }`,
            variables: { where: { username_contains_i: name } },
        }).data.allConsumers[0].kongConsumerId    
    },
    lookupCredentialIssuerById: async function (context, id) {
        return await context.executeGraphQL({
            query: `query GetCredentialIssuerById($id: ID!) {
                        allCredentialIssuers(id: $id) {
                            name
                            authMethod
                            mode
                            oidcDiscoveryUrl
                            initialAccessToken
                            clientId
                            clientSecret
                        }
                    }`,
            variables: { where: { id: id } },
        }).data.allCredentialIssuers[0]    
    },
    addKongConsumer: async function(context, username, kongConsumerId) {
        // This should actually go away and the "Feeders" should be used
        const result = await context.executeGraphQL({
            query: `mutation CreateNewConsumer($username: String, $kongConsumerId: String) {
                        createConsumer(data: { username: $username, kongConsumerId: $kongConsumerId, tags: "[]" }) {
                            id
                        }
                    }`,
            variables: { username, kongConsumerId },
        })
        //{"data":{"createConsumer":{"id":"6004b65c2a7e02414bb3ccb5"}}}
        console.log("KEYSTONE CONSUMER " + JSON.stringify(result))
        return result.data.createConsumer.id        
    },
    linkCredRefsToAccessRequest: async function (context, requestId, credentialReference) {
        const credRefAsString = JSON.stringify(credentialReference)
        try {
            const result = await context.executeGraphQL({
                query: `mutation UpdateConsumerInAccessRequest($reqId: ID!, $credRef: String) {
                            updateAccessRequest(id: $reqId, data: { credentialReference: $credRef } ) {
                                id
                            }
                        }`,
                variables: { requestId, credRefAsString },
            })
            console.log("FINISHED")
            console.log("UPDATE ACCESS REQUEST " + JSON.stringify(result,null, 4))
            return result.data.updateAccessRequest
        } catch (e) {
            console.log("EEERR " + e);
        }        
    }
}
