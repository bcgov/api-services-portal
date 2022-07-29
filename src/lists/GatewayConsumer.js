const { Text, Checkbox, Relationship } = require('@keystonejs/fields');
const { Markdown } = require('@keystonejs/fields-markdown');

const { externallySourced } = require('../components/ExternalSource');

const { byTracking, atTracking } = require('@keystonejs/list-plugins');

const { EnforcementPoint } = require('../authz/enforcement');

const {
  lookupConsumerPlugins,
  lookupKongConsumerId,
} = require('../services/keystone');

const { KongConsumerService } = require('../services/kong');
const { FeederService } = require('../services/feeder');

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
};
