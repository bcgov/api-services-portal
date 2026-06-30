const { Text, Relationship } = require('@keystonejs/fields');
const { EnforcementPoint } = require('../authz/enforcement');
const { atTracking } = require('@keystonejs/list-plugins');
const { RuntimeGroupService } = require('../services/batch/runtime-group');
const { logRuntimeGroupActivityFromHook } = require('../services/workflow/org-activity');
const { logger } = require('../logger');

/*
RuntimeGroup : For SDX this is an Edge Server
*/
module.exports = {
  fields: {
    name: {
      type: Text,
      isRequired: true,
      isUnique: false,
    },
    environment: {
      type: Text,
      isRequired: true,
    },
    namespace: {
      type: Text,
      isRequired: true,
      access: { update: false },
    },
    organization: {
      type: Relationship,
      ref: 'Organization',
      access: { update: false },
    },
    host: {
      type: Text,
      isRequired: true,
      isUnique: true,
      access: { update: false },
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
    validateInput: ({ operation, resolvedData }) => {
      if (operation == 'create') {
        new RuntimeGroupService().validateRuntimeGroup(resolvedData['name']);
      }
    },
    beforeDelete: async function ({ existingItem, context }) {
      await logRuntimeGroupActivityFromHook(
        context,
        'delete',
        existingItem,
        existingItem
      ).catch((e) => {
        logger.error('[OrgActivity] runtime group delete %s', e);
      });
    },
    afterChange: async function ({
      operation,
      existingItem,
      updatedItem,
      originalInput,
      context,
    }) {
      const hookOperation = operation === 'create' ? 'create' : 'update';
      await logRuntimeGroupActivityFromHook(
        context,
        hookOperation,
        existingItem,
        updatedItem,
        originalInput
      ).catch((e) => {
        logger.error('[OrgActivity] runtime group change %s', e);
      });
    },
  },
};
