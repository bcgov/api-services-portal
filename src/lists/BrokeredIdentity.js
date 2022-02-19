const { Text, Relationship } = require('@keystonejs/fields');

const { byTracking, atTracking } = require('@keystonejs/list-plugins');

const { EnforcementPoint } = require('../authz/enforcement');

const { DeleteAccess } = require('../services/workflow');

module.exports = {
  fields: {
    providerAlias: {
      type: Text,
      isRequired: true,
    },
    issuerUrl: {
      type: Text,
      isRequired: true,
    },
    userId: {
      type: Text,
      isRequired: true,
    },
    username: {
      type: Text,
      isRequired: true,
    },
    owner: {
      type: Relationship,
      isRequired: true,
      ref: 'User',
      access: { update: false },
    },
  },
  access: EnforcementPoint,
  hooks: {
    resolveInput: ({
      operation,
      existingItem,
      originalInput,
      resolvedData,
      context,
      listKey,
      fieldPath, // Field hooks only
    }) => {
      if (operation == 'create') {
        if (!('owner' in resolvedData) && context['authedItem']) {
          resolvedData['owner'] = context.authedItem.userId;
        }
      }
      return resolvedData;
    },
    beforeDelete: async function ({
      operation,
      existingItem,
      context,
      listKey,
      fieldPath, // exists only for field hooks
    }) {
      console.log(
        'BEFORE DELETE Remote Subject ' +
          operation +
          ' ' +
          JSON.stringify(existingItem, null, 3)
      );

      await DeleteAccess(
        context.createContext({ skipAccessControl: true }),
        operation,
        { brokeredIdentity: existingItem.id }
      );
    },
  },
  plugins: [atTracking()],
};
