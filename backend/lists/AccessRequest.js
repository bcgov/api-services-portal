const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { clientRegistration } = require('../services/keycloak');
const { createConsumer, addKeyAuthToConsumer } = require('../services/kong');

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
    },
    communication: {
        type: Markdown,
        isRequired: false,
    },
    isApproved: {
      type: Checkbox,
      isRequired: false,
      default: false
    },
    isIssued: {
        type: Checkbox,
        isRequired: false,
        default: false
    },
    isComplete: {
        type: Checkbox,
        isRequired: false,
        default: false
    },
    consumerId: {
        type: Text,
        isRequired: false,
    },
    credential: {
        type: Text,
        isRequired: false,
    },
    requestor: { type: Relationship, isRequired: true, ref: 'User' },
    consumer: { type: Relationship, ref: 'Consumer' },
    datasetGroup: { type: Relationship, isRequired: true, ref: 'DatasetGroup' },
    activity: { type: Relationship, ref: 'Activity', many: true },
  },
  plugins: [
    byTracking(),
    atTracking()
  ],
  hooks: {
    beforeChange: ({
        operation,
        existingItem,
        originalInput,
        resolvedData,
        context,
        listKey,
        fieldPath, // exists only for field hooks
      }) => {
        console.log("BEFORE CHANGE TO ACCESS REQUEST " + operation + " " + JSON.stringify(resolvedData, null, 3));
    },
    afterChange: (async function ({
        operation,
        existingItem,
        originalInput,
        updatedItem,
        context,
        listKey,
        fieldPath, // exists only for field hooks
      }) {
        console.log("AFTER CHANGE TO ACCESS REQUEST EXISTINGITEM" + operation + " " + JSON.stringify(existingItem));
        console.log("AFTER CHANGE TO ACCESS REQUEST ORIGINALINPUT" + operation + " " + JSON.stringify(originalInput));
        console.log("AFTER CHANGE TO ACCESS REQUEST " + operation + " " + JSON.stringify(updatedItem));
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
        if (updatedItem.isIssued) {
            const consumerId = updatedItem.consumerId
            const kongUrl = "https://adminapi-264e6f-dev.apps.silver.devops.gov.bc.ca"
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3NWI2Mzg4NC1iN2RiLTRiODItOWFkZS02NDk0ZmUxNzI1N2MifQ.eyJleHAiOjAsImlhdCI6MTYxMDU3Mjc5NiwianRpIjoiNmVmZTVhY2EtYThmZS00ODg4LWI4YjQtMDAyODRmNDc5YzA5IiwiaXNzIjoiaHR0cHM6Ly9kZXYub2lkYy5nb3YuYmMuY2EvYXV0aC9yZWFsbXMveHRta2U3a3kiLCJhdWQiOiJodHRwczovL2Rldi5vaWRjLmdvdi5iYy5jYS9hdXRoL3JlYWxtcy94dG1rZTdreSIsInR5cCI6IkluaXRpYWxBY2Nlc3NUb2tlbiJ9.yOP-Pf84ilqtydHOIYiYI4oHjRGFvUM4vs6Sz2FRTm4"
            const client = await clientRegistration("https://dev.oidc.gov.bc.ca/auth", "xtmke7ky", token, consumerId, consumerId + "-secret")
            console.log("CLIENT = "+JSON.stringify(client, null, 3))
            const consumer = await createConsumer (kongUrl, consumerId, '')
            console.log("CONSUMER = "+ JSON.stringify(consumer, null, 3))
            const apiKey = await addKeyAuthToConsumer (kongUrl, consumer.id)
            console.log(JSON.stringify(apiKey, null, 3))
        }
        // }
        

    })
  }
}
