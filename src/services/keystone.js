const assert = require('assert').strict;

module.exports = {
    lookupEnvironmentAndApplicationByAccessRequest: async function lookupEnvironmentAndApplicationByAccessRequest (context, id) {
        const result = await context.executeGraphQL({
            query: `query GetSpecificEnvironment($id: ID!) {
                        allAccessRequests(where: {id: $id}) {
                            productEnvironment {
                                name
                                authMethod
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
        })
        console.log("lookupEnvironmentAndApplicationByAccessRequest " + JSON.stringify(result))
        return result.data.allAccessRequests[0]
    },
    lookupKongConsumerIdByName: async function (context, name) {
        assert.strictEqual(name != null && typeof name != 'undefined' && name != "", true, "Invalid Consumer Username")
        const result = await context.executeGraphQL({
            query: `query FindConsumerByUsername($where: ConsumerWhereInput) {
                        allConsumers(where: $where) {
                            kongConsumerId
                        }
                    }`,
            variables: { where: { username: name } },
        })
        console.log("lookupKongConsumerIdByName [" + name+ "] " + JSON.stringify(result))
        assert.strictEqual(result.data.allConsumers.length, 1, "Unexpected data returned for Consumer lookup")
        return result.data.allConsumers[0].kongConsumerId
    },
    lookupCredentialIssuerById: async function (context, id) {
        const result = await context.executeGraphQL({
            query: `query GetCredentialIssuerById($id: ID!) {
                        allCredentialIssuers(where: {id: $id}) {
                            name
                            authMethod
                            mode
                            oidcDiscoveryUrl
                            initialAccessToken
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
        // This should actually go away and the "Feeders" should be used
        const result = await context.executeGraphQL({
            query: `mutation CreateNewConsumer($username: String, $kongConsumerId: String) {
                        createConsumer(data: { username: $username, kongConsumerId: $kongConsumerId, tags: "[]" }) {
                            id
                            kongConsumerId
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
                query: `mutation UpdateConsumerInAccessRequest($requestId: ID!, $credRefAsString: String) {
                            updateAccessRequest(id: $requestId, data: { credentialReference: $credRefAsString } ) {
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
