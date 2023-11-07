const { Text, Checkbox, Relationship } = require('@keystonejs/fields');
const { Markdown } = require('@keystonejs/fields-markdown');

const { byTracking, atTracking } = require('@keystonejs/list-plugins');

const { EnforcementPoint } = require('../authz/enforcement');

module.exports = {
  fields: {
    name: {
      type: Text,
      isRequired: true,
      isUnique: true,
    },
    query: {
      type: Text,
      isRequired: true,
    },
    day: {
      type: Text,
      isRequired: true,
    },
    metric: {
      type: Text,
      isRequired: true,
    },
    values: {
      type: Text,
      isRequired: true,
    },
    namespace: {
      type: Text,
      isRequired: false,
    },
    service: { type: Relationship, ref: 'GatewayService', many: false },
  },
  access: EnforcementPoint,
  plugins: [atTracking()],
};
