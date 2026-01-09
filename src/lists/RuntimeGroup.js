const { Text, Relationship } = require('@keystonejs/fields');
const { EnforcementPoint } = require('../authz/enforcement');
const { regExprValidation } = require('../services/utils');
const { atTracking } = require('@keystonejs/list-plugins');

/*
RuntimeGroup : For SDX this is an Edge Server
*/
module.exports = {
  fields: {
    name: {
      type: Text,
      isRequired: true,
      isUnique: true,
    },
    namespace: {
      type: Text,
      isRequired: true,
      access: { update: false },
    },
    organization: { type: Relationship, ref: 'Organization' },
    host: {
      type: Text,
      isRequired: true,
      isUnique: true,
    },
    hostedOrganizations: {
      type: Relationship,
      ref: 'Organization',
      many: true,
    },
    sdxEndpoint: {
      type: Text,
      isRequired: false,
    },
    consumerEndpoint: {
      type: Text,
      isRequired: false,
    },
  },
  access: EnforcementPoint,
  plugins: [atTracking()],
  hooks: {
    resolveInput: async function ({ operation, resolvedData }) {
      if (operation == 'create') {
        resolvedData.namespace = `sdx-edge-${resolvedData['name']}`;
      }
      return resolvedData;
    },
    validateInput: ({ resolvedData }) => {
      regExprValidation(
        '^[a-z0-9]{4,10}$',
        resolvedData['name'],
        'Runtime Group name must be between 4 and 10 lowercase alpha-numeric characters'
      );
    },
  },
};
