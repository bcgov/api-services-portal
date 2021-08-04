const { Text, Checkbox, Relationship } = require('@keystonejs/fields');
const { Markdown } = require('@keystonejs/fields-markdown');

const { byTracking } = require('../components/ByTracking');

const { atTracking } = require('@keystonejs/list-plugins');

const {
  FieldEnforcementPoint,
  EnforcementPoint,
} = require('../authz/enforcement');

const { Apply, Validate } = require('../services/workflow');

const { getCurrentNamespace } = require('../services/keystone/namespace');

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
      access: FieldEnforcementPoint,
    },
    isIssued: {
      type: Checkbox,
      isRequired: false,
      default: false,
      access: FieldEnforcementPoint,
    },
    isComplete: {
      type: Checkbox,
      isRequired: false,
      default: false,
    },
    credential: {
      type: Text,
      isRequired: false,
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
    productEnvironment: {
      type: Relationship,
      isRequired: true,
      ref: 'Environment',
    },
    serviceAccess: {
      type: Relationship,
      isRequired: false,
      ref: 'ServiceAccess',
    },
  },
  access: EnforcementPoint,
  plugins: [byTracking(), atTracking()],
  hooks: {
    validateInput: async function ({
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
      await Validate(
        context.createContext({ skipAccessControl: true }),
        operation,
        existingItem,
        originalInput,
        resolvedData,
        addValidationError
      );
    },
    beforeChange: ({
      operation,
      existingItem,
      originalInput,
      resolvedData,
      context,
      listKey,
      fieldPath, // exists only for field hooks
    }) => {},
    afterChange: async function ({
      operation,
      existingItem,
      originalInput,
      updatedItem,
      context,
      listKey,
      fieldPath, // exists only for field hooks
    }) {
      await Apply(
        context.createContext({ skipAccessControl: true }),
        operation,
        existingItem,
        originalInput,
        updatedItem
      );
      const namespaceData = await getCurrentNamespace(context);
      console.log(JSON.stringify(namespaceData));
    },
  },
};
