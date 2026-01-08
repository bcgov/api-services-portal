const { Slug, Text, Relationship } = require('@keystonejs/fields');
const { EnforcementPoint } = require('../authz/enforcement');
const { StructuredActivityService } = require('../services/workflow');
const { newNamespaceID } = require('../services/identifiers');
const { SubsystemService } = require('../services/batch/subsystem');

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
    validateInput: ({ context, resolvedData, addValidationError }) => {
      new SubsystemService().validateSubsystem(resolvedData['name']);
    },
    afterDelete: async function ({ existingItem, context }) {
      await new StructuredActivityService(
        context,
        existingItem.namespace
      ).logListActivity(
        true,
        'delete',
        'subsystem',
        {
          subsystem: existingItem,
        },
        '{actor} {action} {entity} {subsystem}'
      );
    },

    afterChange: async function ({ operation, updatedItem, context }) {
      await new StructuredActivityService(
        context,
        updatedItem.namespace
      ).logListActivity(
        true,
        operation,
        'subsystem',
        {
          subsystem: updatedItem,
        },
        '{actor} {action} {entity} {subsystem}'
      );
    },
  },
};
