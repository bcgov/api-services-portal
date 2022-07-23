const { Text, Relationship } = require('@keystonejs/fields');

module.exports = {
  fields: {
    namespace: {
      type: Text,
      isRequired: true,
    },
    name: {
      type: Text,
      isRequired: true,
    },
    value: {
      type: Text,
      isRequired: true,
    },
    consumer: { type: Relationship, isRequired: true, ref: 'GatewayConsumer' },
  },
};
