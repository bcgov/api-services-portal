const { Text } = require('@keystonejs/fields');
const { EnforcementPoint } = require('../authz/enforcement');
const { AutoIncrement } = require('@keystonejs/fields-auto-increment');

module.exports = {
  fields: {
    ref_id: {
      type: AutoIncrement,
      gqlType: 'Int',
      isUnique: true,
      access: { update: false },
    },
    client_id: {
      type: Text,
      isRequired: true,
      access: { update: false },
    },
    service_id: {
      type: Text,
      isRequired: true,
      access: { update: false },
    },
  },
  access: EnforcementPoint,
};
