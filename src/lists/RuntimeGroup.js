const { Text, Relationship } = require('@keystonejs/fields');
const { EnforcementPoint } = require('../authz/enforcement');
const { atTracking } = require('@keystonejs/list-plugins');
const { RuntimeGroupService } = require('../services/batch/runtime-group');

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
        resolvedData.namespace = `sdx-rg-${resolvedData['name']}`;
      }
      return resolvedData;
    },
    validateInput: ({ resolvedData }) => {
      new RuntimeGroupService().validateRuntimeGroup(resolvedData['name']);
    },
  },
};
