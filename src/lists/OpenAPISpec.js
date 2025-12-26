const { Select, Text, Relationship } = require('@keystonejs/fields');
const { EnforcementPoint } = require('../authz/enforcement');
const { newID } = require('../services/identifiers');

module.exports = {
  fields: {
    ref: {
      type: Text,
      isRequired: true,
      isUnique: true,
      access: { update: false },
    },
    name: {
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
    organization: { type: Relationship, ref: 'Organization' },
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
    summary: {
      type: Text,
      isRequired: true,
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
    resolveInput: async function ({ operation, resolvedData }) {
      if (operation === 'create') {
        resolvedData.name = newID(20);
      }
      return resolvedData;
    },
  },
  access: EnforcementPoint,
};
