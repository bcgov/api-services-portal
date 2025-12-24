const { Slug, Text } = require('@keystonejs/fields');
const { EnforcementPoint } = require('../authz/enforcement');
const { logger } = require('../logger');
const { strict: assert, AssertionError } = require('assert');
const { StructuredActivityService } = require('../services/workflow');
const { regExprValidation } = require('../services/utils');

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
    slug: {
      type: Slug,
      adminConfig: {
        isReadOnly: true,
      },
      generate: ({ resolvedData, existingItem }) => {
        const ns =
          'namespace' in resolvedData
            ? resolvedData['namespace']
            : existingItem['namespace'];
        const name =
          'name' in resolvedData ? resolvedData['name'] : existingItem['name'];
        return `${ns}.${name}`;
      },
      makeUnique: (val) => val,
      isUnique: true,
    },
  },
  access: EnforcementPoint,
  hooks: {
    resolveInput: ({ context, operation, resolvedData }) => {
      logger.debug(
        '[List.Subsystem] Auth %s %j',
        operation,
        context['authedItem']
      );
      if (operation == 'create') {
        if (context['authedItem'] && 'namespace' in context['authedItem']) {
          resolvedData['namespace'] = context['authedItem']['namespace'];
        }
      }
      logger.debug('[List.Subsystem] Resolved %j', resolvedData);
      return resolvedData;
    },
    validateInput: ({ resolvedData, addValidationError }) => {
      try {
        regExprValidation(
          '^[A-Z0-9-]{3,20}$',
          resolvedData['name'],
          "Product name must be between 3 and 20 alpha-numeric characters (including special character '-')"
        );
      } catch (ex) {
        if (ex instanceof AssertionError) {
          addValidationError(ex.message);
        } else {
          throw ex;
        }
      }
    },
    afterDelete: async function ({ existingItem, context }) {
      await new StructuredActivityService(
        context,
        context.authedItem['namespace']
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
        context.authedItem['namespace']
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
