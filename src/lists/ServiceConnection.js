const { Text } = require('@keystonejs/fields');
const { EnforcementPoint } = require('../authz/enforcement');

module.exports = {
  fields: {
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
