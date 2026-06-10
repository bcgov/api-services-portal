const { Select, Text, Relationship } = require('@keystonejs/fields');
const { EnforcementPoint } = require('../authz/enforcement');

module.exports = {
  fields: {
    ref: {
      type: Text,
      isRequired: true,
      isUnique: true,
      access: { update: false },
    },
    specVersion: {
      type: Text,
      isRequired: true,
      access: { update: false },
    },
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
      isRequired: false,
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
  access: EnforcementPoint,
};
