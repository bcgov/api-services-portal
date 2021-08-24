const { Text, Checkbox, Relationship } = require('@keystonejs/fields');
const { Markdown } = require('@keystonejs/fields-markdown');

const { externallySourced } = require('../components/ExternalSource');

const { byTracking, atTracking } = require('@keystonejs/list-plugins');

const { EnforcementPoint } = require('../authz/enforcement');

const { DeleteGatewayConfig } = require('../services/workflow');

module.exports = {
  fields: {
    name: {
      type: Text,
      isRequired: true,
      isUnique: true,
      adminConfig: {
        isReadOnly: false,
      },
    },
    // kongServiceId: {
    //     type: Text,
    //     isRequired: true,
    //     adminConfig: {
    //         isReadOnly: false
    //     }
    // },
    namespace: {
      type: Text,
      isRequired: true,
      adminConfig: {
        isReadOnly: false,
      },
    },
    host: {
      type: Text,
      isRequired: true,
      adminConfig: {
        isReadOnly: false,
      },
    },
    tags: {
      type: Text,
      isRequired: true,
      adminConfig: {
        isReadOnly: false,
      },
    },
    routes: { type: Relationship, ref: 'GatewayRoute.service', many: true },
    plugins: { type: Relationship, ref: 'GatewayPlugin', many: true },
    environment: {
      type: Relationship,
      ref: 'Environment.services',
      many: false,
    },
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
      await DeleteGatewayConfig(
        context.createContext({ skipAccessControl: true }),
        operation,
        { service: existingItem.id }
      );
    },
  },
};
