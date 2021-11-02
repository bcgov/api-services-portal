const { Select, Text, Checkbox, Relationship } = require('@keystonejs/fields');
const { Markdown } = require('@keystonejs/fields-markdown');

const { byTracking } = require('../components/ByTracking');

const { atTracking } = require('@keystonejs/list-plugins');

const {
  FieldEnforcementPoint,
  EnforcementPoint,
} = require('../authz/enforcement');

const { DeleteAccess } = require('../services/workflow');

// const regenerateApiKey = async function(context, consumer) {
//     const kongConsumerId = await lookupKongConsumerIdByName(context, appId)

//     const apiKey = await kongApi.genKeyForConsumer (kongConsumerId)
//     return apiKey.apiKey
// }

module.exports = {
  fields: {
    name: {
      type: Text,
      isRequired: true,
      isUnique: true,
    },
    namespace: {
      type: Text,
      isRequired: false,
    },
    active: {
      type: Checkbox,
      isRequired: true,
      default: false,
    },
    aclEnabled: {
      type: Checkbox,
      isRequired: true,
      default: false,
    },
    consumerType: {
      type: Select,
      emptyOption: false,
      defaultValue: 'client',
      options: [
        { value: 'client', label: 'Application' },
        { value: 'user', label: 'User' },
      ],
    },
    credentialReference: {
      type: Text,
      isRequired: false,
    },
    credential: {
      type: Text,
      isRequired: false,
    },
    clientRoles: {
      type: Text,
      isRequired: false,
    },
    consumer: { type: Relationship, isRequired: true, ref: 'GatewayConsumer' },
    application: { type: Relationship, isRequired: false, ref: 'Application' },
    productEnvironment: {
      type: Relationship,
      isRequired: false,
      ref: 'Environment',
    },
    labels: { type: Relationship, ref: 'Label', many: true },
  },
  access: EnforcementPoint,
  plugins: [atTracking()],
  hooks: {
    afterChange: async function ({
      operation,
      existingItem,
      originalInput,
      updatedItem,
      context,
      listKey,
      fieldPath, // exists only for field hooks
    }) {
      //await workflow.RegenerateCredential(context, operation, existingItem, originalInput, updatedItem)
    },
    beforeDelete: async function ({
      operation,
      existingItem,
      context,
      listKey,
      fieldPath, // exists only for field hooks
    }) {
      await DeleteAccess(
        context.createContext({ skipAccessControl: true }),
        operation,
        { serviceAccess: existingItem.id }
      );
    },
  },
};
