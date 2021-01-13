const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

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
    afterChange: ({
        operation,
        existingItem,
        originalInput,
        updatedItem,
        context,
        listKey,
        fieldPath, // exists only for field hooks
      }) => {
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
    }
  }
}
