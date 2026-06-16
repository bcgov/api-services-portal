const { Text, Checkbox, Relationship } = require('@keystonejs/fields');
const { Markdown } = require('@keystonejs/fields-markdown');

const { byTracking, atTracking } = require('@keystonejs/list-plugins');

const { EnforcementPoint } = require('../authz/enforcement');

// Aidan (actor) approved (action) AccessRequest[erxAPIs for Bill #222-333-333] (type,name,refId) "Approved access request" (message)
module.exports = {
  fields: {
    extRefId: {
      type: Text,
      isRequired: false,
    },
    type: {
      type: Text,
      isRequired: true,
    },
    name: {
      type: Text,
      isRequired: true,
    },
    action: {
      type: Text,
      isRequired: true,
    },
    result: {
      type: Text,
      isRequired: false,
    },
    message: {
      type: Text,
      isRequired: false,
    },
    context: {
      type: Text,
      isRequired: false,
    },
    refId: {
      type: Text,
      isRequired: true,
    },
    namespace: {
      type: Text,
      isRequired: false,
    },
    filterKey1: {
      type: Text,
      isRequired: false,
    },
    filterKey2: {
      type: Text,
      isRequired: false,
    },
    filterKey3: {
      type: Text,
      isRequired: false,
    },
    filterKey4: {
      type: Text,
      isRequired: false,
    },
    actor: { type: Relationship, ref: 'User' },
    blob: { type: Relationship, ref: 'Blob' },
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
      if (
        updatedItem.type === 'GatewayConfig' &&
        updatedItem.result === 'completed'
      ) {
        const { FeederService } = require('../services/feeder');
        const feederApi = new FeederService(process.env.FEEDER_URL);
        feederApi
          .forceSync('kong', 'namespace', updatedItem.namespace)
          .catch((err) => {
            console.log('Capture and log error ' + err);
          });
      }
    },
  },
};
