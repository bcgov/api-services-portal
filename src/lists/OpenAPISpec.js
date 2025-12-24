const { Select, Text, Relationship } = require('@keystonejs/fields');
const { EnforcementPoint } = require('../authz/enforcement');
const { LoadOpenAPISpec } = require('../services/workflow/openapi-spec-loader');

module.exports = {
  fields: {
    ref: {
      type: Text,
      isRequired: true,
      isUnique: true,
      access: { update: false },
    },
    namespace: {
      type: Text,
      isRequired: true,
      access: { update: false },
    },
    state: {
      type: Select,
      emptyOption: false,
      required: true,
      dataType: 'string',
      defaultValue: 'archived',
      options: [
        { value: 'archived', label: 'Archived' },
        { value: 'active', label: 'Active' },
      ],
    },
    version: {
      type: Text,
      isRequired: true,
      access: { update: false },
    },
    title: {
      type: Text,
      isRequired: true,
      access: { update: false },
    },
    description: {
      type: Text,
      isRequired: true,
    },
    operations: {
      type: Text,
      isRequired: true,
    },
    spec: {
      type: Text,
      isRequired: true,
      access: { update: false },
    },
    subsystem: {
      type: Relationship,
      ref: 'Subsystem',
      many: false,
      isRequired: true,
      access: { update: false },
    },
  },
  hooks: {
    resolveInput: async function ({
      operation,
      existingItem,
      originalInput,
      resolvedData,
      context,
      listKey,
      fieldPath, // Field hooks only
    }) {
      if (operation === 'create') {
        return await LoadOpenAPISpec(context, resolvedData);
      } else {
        return resolvedData;
      }
    },
  },
  access: EnforcementPoint,
};
