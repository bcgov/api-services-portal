const { Select, Text, Relationship } = require('@keystonejs/fields');
const { EnforcementPoint } = require('../authz/enforcement');
const { logOpenAPISpecActivityFromHook } = require('../services/workflow/org-activity');
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
  hooks: {
    afterDelete: async function ({ existingItem, context }) {
      await logOpenAPISpecActivityFromHook(
        context,
        'delete',
        existingItem,
        existingItem
      ).catch((e) => {
        logger.error('[OrgActivity] service delete %s', e);
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
        logger.error('[OrgActivity] service publish %s', e);
      });
    },
  },
};
