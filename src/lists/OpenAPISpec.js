const { Text, Relationship } = require('@keystonejs/fields');
const { EnforcementPoint } = require('../authz/enforcement');
const {
  logOpenAPISpecActivityFromHook,
} = require('../services/workflow/org-activity');
const { logger } = require('../logger');

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
    environment: {
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
    // annotations are a general space for a few different bits of metadata
    // 1. capturing the different rulesets that have passed for this specification
    // 2. sha1 hash of the particular spec
    // 3. type of spec (tool or data) - perhaps can influence the filtering or types of connections
    //
    annotations: {
      type: Text,
      isRequired: false,
    },
    specVersion: {
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
  access: EnforcementPoint,
  hooks: {
    resolveInput: ({ operation, resolvedData }) => {
      if (operation === 'update') {
        delete resolvedData['specVersion'];
      }
      return resolvedData;
    },
    afterDelete: async function ({ existingItem, context }) {
      await logOpenAPISpecActivityFromHook(
        context,
        'delete',
        existingItem,
        existingItem
      ).catch((e) => {
        logger.error('[OrgActivity] open api spec delete %s', e);
      });
    },
    afterChange: async function ({
      operation,
      existingItem,
      updatedItem,
      context,
    }) {
      if (operation !== 'create') {
        return;
      }
      await logOpenAPISpecActivityFromHook(
        context,
        'create',
        existingItem,
        updatedItem
      ).catch((e) => {
        logger.error('[OrgActivity] open api spec create %s', e);
      });
    },
  },
};
