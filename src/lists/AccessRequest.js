const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

const { FieldEnforcementPoint, EnforcementPoint } = require('../authz/enforcement');
const workflow = require('../services/workflow');

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
      default: false,
      access: FieldEnforcementPoint
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
    credentialReference: {
        type: Text,
        isRequired: false,
    },
    credential: {
        type: Text,
        isRequired: false,
    },
    requestor: { type: Relationship, isRequired: true, ref: 'User' },
    application: { type: Relationship, isRequired: true, ref: 'Application' },
    productEnvironment: { type: Relationship, isRequired: true, ref: 'Environment' },
    activity: { type: Relationship, ref: 'Activity', many: true },
  },
  access: EnforcementPoint,
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
        workflow(context, operation, existingItem, originalInput, updatedItem)
    })
  }
}
