/*
When an AccessRequest is first made, a Kong Consumer should be created (if not already existing).
And then a SyncConsumersByNamespace should be done to pull changes from Kong into KeystoneJS.

When approved, determine whether the credential issuing is automatic or 

Workflow:

- initializeConsumer()
- requestApproved()
- credentialIssued()
- issueCredential()


Scenarios:
- Public API - Try it
- API Key protected - Test Environment : Try It
- API Key protected w/ ACL - Test Environment : Request Access -> RESULT: Get added to a group
- API Key protected w/ ACL - Production Environment : Request Access -> RESULT: Get new credentials and added to a group
- OIDC protected - Test environment : Request Access -> RESULT (auto): after approval, send credentials to Requestor
- OIDC protected - Prod environment : Request Access -> RESULT (manual): send credentials to Requestor
*/
const workflow = (listKey, operation, existingItem, context) => {
    // If isIssued was moved to True, then
    // call Keycloak with the token from the Issuer
    // And put the Token in the request for the Requestor
    
    // Lookup the datasetGroup and then the Credential Issuer
    // Use the information to invoke Keycloak
    // Need: JWT Token, Client ID, generate a Secret
    // Scope(?)
    //
    // Communicate with Requestor
    // Mark AccessRequest as Complete
    // 
    // async function doit() {
    const pkgEnvResult = existingItem ? (await context.executeGraphQL({
        query: `query ($id: ID!) {
                    allEnvironments(id: $id) {
                        name
                        authMethod
                        package {
                            name
                        }
                    }
                }`,
        variables: { id: existingItem.id },
    })).data.allEnvironments[0] : null

    console.log(JSON.stringify(pkgEnvResult, null, 3));

    if (originalInput.credential == "NEW") {
        const username = existingItem.consumerId
        const result = await context.executeGraphQL({
            query: `query ($where: ConsumerWhereInput) {
                        allConsumers(where: $where) {
                            kongConsumerId
                        }
                    }`,
            variables: { where: { username_contains_i: username } },
        })
        console.log("ANSWER = "+username + " " + JSON.stringify(result));
        const kongConsumerId = result.data.allConsumers[0].kongConsumerId

        const apiKey = await genKeyForConsumer (kongConsumerId)
        console.log("API KEY " + JSON.stringify(apiKey, null, 3))
        updatedItem['credential'] = apiKey.apiKey
    }

    if (existingItem && existingItem.isIssued == null && updatedItem.isIssued) {
        const consumerUsername = updatedItem.consumerId
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3NWI2Mzg4NC1iN2RiLTRiODItOWFkZS02NDk0ZmUxNzI1N2MifQ.eyJleHAiOjAsImlhdCI6MTYxMDkxNzYxOCwianRpIjoiNWU3N2MyMzItMzUyOC00Mjg2LTg2NGItZGNjNzlhMzQ5NWRiIiwiaXNzIjoiaHR0cHM6Ly9kZXYub2lkYy5nb3YuYmMuY2EvYXV0aC9yZWFsbXMveHRta2U3a3kiLCJhdWQiOiJodHRwczovL2Rldi5vaWRjLmdvdi5iYy5jYS9hdXRoL3JlYWxtcy94dG1rZTdreSIsInR5cCI6IkluaXRpYWxBY2Nlc3NUb2tlbiJ9.diEwRmTS32XSyX0OVj-yzngKzrWD4dy5XfySphHFWWo"
        const client = await clientRegistration("https://dev.oidc.gov.bc.ca/auth", "xtmke7ky", token, consumerUsername, consumerUsername + "-secret")
        console.log("CLIENT = "+JSON.stringify(client, null, 3))
        const consumer = await createKongConsumer (consumerUsername, '')
        console.log("CONSUMER = "+ JSON.stringify(consumer, null, 3))
        if (consumer != null) {
            const apiKey = await addKeyAuthToConsumer (consumer.id)
            console.log("API KEY " + JSON.stringify(apiKey, null, 3))
            // {
            //     "apiKey": "z7Ynl7OlcLYHTIt4uIAhzQ36I5zg07z1"
            //  }
        }

        let consumerId = null

        if (true) {
            const username = consumerUsername
            const kongConsumerId = consumer.id
            const result = await context.executeGraphQL({
                query: `mutation ($username: String, $kongConsumerId: String) {
                            createConsumer(data: { username: $username, kongConsumerId: $kongConsumerId, tags: "[]" }) {
                                id
                            }
                        }`,
                variables: { username, kongConsumerId },
            })
            //{"data":{"createConsumer":{"id":"6004b65c2a7e02414bb3ccb5"}}}
            console.log("KEYSTONE CONSUMER " + JSON.stringify(result))
            consumerId = result.data.createConsumer.id
        }
        if (true) {
            console.log("UPD AR " + updatedItem.id)
            console.log("UPD AR " + consumerId)
            const reqId = updatedItem.id
            try {
                const result = await context.executeGraphQL({
                    query: `mutation ($reqId: ID!, $consumerId: ID!) {
                                updateAccessRequest(id: $reqId, data: { consumer: { connect: { id: $consumerId } } } ) {
                                    id
                                }
                            }`,
                    variables: { reqId, consumerId },
                }).catch (err => {
                    console.log("AccessRequest : failed update " + err)
                })
                console.log("FINISHED")
                console.log("UPDATE ACCESS REQUEST " + JSON.stringify(result,null, 4))
            } catch (e) {
                console.log("EEERR " + e);
            }

        }
    }
    // }

    // const name = updatedItem.name
    const refId = updatedItem.id
    const action = operation
    const message = "Changes to " + JSON.stringify(originalInput)

    const act = await recordActivity (context, action, 'AccessRequest', refId, message)
    console.log("ACTIVITY = "+ JSON.stringify(act, null, 3))

}

module.exports = {
    Workflow: workflow
}