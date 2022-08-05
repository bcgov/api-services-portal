const { Text, Relationship } = require('@keystonejs/fields');
const { atTracking } = require('@keystonejs/list-plugins');
const { externallySourced } = require('../components/ExternalSource');
const { EnforcementPoint } = require('../authz/enforcement');
const { delAllConsumerLabels } = require('../services/keystone/labels');

module.exports = {
  fields: {
    username: {
      type: Text,
      isRequired: true,
      isUnique: true,
      adminConfig: {
        isReadOnly: true,
      },
    },
    customId: {
      type: Text,
      isRequired: false,
      adminConfig: {
        isReadOnly: true,
      },
    },
    // kongConsumerId: {
    //     type: Text,
    //     isRequired: false,
    //     adminConfig: {
    //         isReadOnly: true
    //     }
    // },
    aclGroups: {
      type: Text,
      isRequired: false,
      adminConfig: {
        isReadOnly: true,
      },
    },
    namespace: {
      type: Text,
      isRequired: false,
      adminConfig: {
        isReadOnly: true,
      },
    },
    tags: {
      type: Text,
      isRequired: false,
      adminConfig: {
        isReadOnly: true,
      },
    },
    plugins: { type: Relationship, ref: 'GatewayPlugin', many: true },
  },
  access: EnforcementPoint,
  plugins: [externallySourced(), atTracking()],
  hooks: {
    beforeDelete: async function ({
      operation,
      existingItem,
      context,
      listKey,
      fieldPath, // exists only for field hooks
    }) {
      const namespace = context.authedItem['namespace'];
      if (namespace) {
        await delAllConsumerLabels(context, namespace, existingItem.id);
      }
    },
  },
};
