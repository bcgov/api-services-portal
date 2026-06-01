const { Slug, Text, Relationship } = require('@keystonejs/fields');
const { Markdown } = require('@keystonejs/fields-markdown');
const { EnforcementPoint } = require('../authz/enforcement');
const { logSubsystemActivityFromHook } = require('../services/workflow/org-activity');
const { newNamespaceID } = require('../services/identifiers');
const { SubsystemService } = require('../services/batch/subsystem');
const { logger } = require('../logger');

module.exports = {
  fields: {
    name: {
      type: Text,
      isRequired: true,
      access: { update: false },
    },
    namespace: {
      type: Text,
      isRequired: true,
      access: { update: false },
    },
    description: {
      type: Markdown,
      isMultiline: true,
      isRequired: false,
    },
    organization: { type: Relationship, ref: 'Organization' },
    slug: {
      type: Slug,
      adminConfig: {
        isReadOnly: true,
      },
      generate: ({ resolvedData, existingItem }) => {
        const org =
          'organization' in resolvedData
            ? resolvedData['organization']
            : existingItem['organization'];
        const name =
          'name' in resolvedData ? resolvedData['name'] : existingItem['name'];
        return `${org}.${name}`;
      },
      makeUnique: (val) => val,
      isUnique: true,
    },
  },
  access: EnforcementPoint,
  hooks: {
    resolveInput: ({ operation, resolvedData }) => {
      if (operation !== 'create') {
        return resolvedData;
      }
      resolvedData.namespace = `sdx-${newNamespaceID()}`;
      return resolvedData;
    },
    validateInput: ({ resolvedData, operation }) => {
      if (operation == 'create') {
        new SubsystemService().validateSubsystem(resolvedData['name']);
      }
    },
    afterDelete: async function ({ existingItem, context }) {
      await logSubsystemActivityFromHook(
        context,
        'delete',
        existingItem,
        existingItem
      ).catch((e) => {
        logger.error('[OrgActivity] subsystem delete %s', e);
      });
    },

    afterChange: async function ({
      operation,
      existingItem,
      updatedItem,
      context,
    }) {
      const hookOperation = operation === 'create' ? 'create' : 'update';
      await logSubsystemActivityFromHook(
        context,
        hookOperation,
        existingItem,
        updatedItem
      ).catch((e) => {
        logger.error('[OrgActivity] subsystem change %s', e);
      });
    },
  },
};
