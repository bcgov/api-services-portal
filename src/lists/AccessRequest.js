const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking } = require('../components/ByTracking')

const { atTracking } = require('@keystonejs/list-plugins')

const { FieldEnforcementPoint, EnforcementPoint } = require('../authz/enforcement');
const workflow = require('../services/workflow')

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
        default: false,
        access: FieldEnforcementPoint
    },
    isComplete: {
        type: Checkbox,
        isRequired: false,
        default: false
    },
    controls: {
        type: Text,
        isRequired: true,
    },
    additionalDetails: {
        type: Text,
        isMultiline: true,
        isRequired: false,
    },  
    requestor: { type: Relationship, isRequired: true, ref: 'User' },
    application: { type: Relationship, isRequired: false, ref: 'Application' },
    productEnvironment: { type: Relationship, isRequired: true, ref: 'Environment' },
    activity: { type: Relationship, ref: 'Activity', many: true },
  },
  access: EnforcementPoint,
  plugins: [
    byTracking(),
    atTracking()
  ],
  hooks: {
    validateInput: (async function ({
        operation,
        existingItem,
        originalInput,
        resolvedData,
        context,
        addFieldValidationError, // Field hooks only
        addValidationError, // List hooks only
        listKey,
        fieldPath, // Field hooks only
    }) {
        console.log("VALIDATE AR " + operation + " " + JSON.stringify(existingItem, null, 3));
        console.log("VALIDATE AR " + operation + " " + JSON.stringify(originalInput, null, 3));
        console.log("VALIDATE AR " + operation + " " + JSON.stringify(resolvedData, null, 3));
        await workflow.Validate(context, operation, existingItem, originalInput, resolvedData, addValidationError)
    }),
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
        await workflow.Apply(context, operation, existingItem, originalInput, updatedItem)
    })
  }
}
