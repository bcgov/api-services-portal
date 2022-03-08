const { Text, Relationship } = require('@keystonejs/fields');
const { Markdown } = require('@keystonejs/fields-markdown');
const { newProductID, isProductID } = require('../services/identifiers');
const {
  FieldEnforcementPoint,
  EnforcementPoint,
} = require('../authz/enforcement');
const { logger } = require('../logger');
const { lookupProduct } = require('../services/keystone/product-environment');
const { strict: assert } = require('assert');

module.exports = {
  fields: {
    appId: {
      type: Text,
      isRequired: true,
      isUnique: false,
    },
    name: {
      type: Text,
      isRequired: true,
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
    dataset: { type: Relationship, ref: 'Dataset' },
    organization: { type: Relationship, ref: 'Organization', many: false },
    organizationUnit: { type: Relationship, ref: 'OrganizationUnit' },
    environments: {
      type: Relationship,
      ref: 'Environment.product',
      many: true,
    },
  },
  access: EnforcementPoint,
  hooks: {
    resolveInput: ({ context, operation, resolvedData }) => {
      logger.debug('[List.Product] Auth %j', context['authedItem']);
      if (operation == 'create') {
        if ('appId' in resolvedData && isProductID(resolvedData['appId'])) {
        } else {
          resolvedData['appId'] = newProductID();
        }
        if (context['authedItem'] && 'namespace' in context['authedItem']) {
          resolvedData['namespace'] = context['authedItem']['namespace'];
        }
      }
      logger.debug('[List.Product] Resolved %j', resolvedData);
      return resolvedData;
    },

    validateDelete: async function ({
      operation,
      existingItem,
      context,
      listKey,
      fieldPath, // exists only for field hooks
      addValidationError,
    }) {
      // Don't delete a Product if there are Environments
      logger.error('Before Delete %j', existingItem);

      const product = await lookupProduct(context, existingItem.id);
      logger.error('Product %j', product);

      assert.strictEqual(
        product.environments.length == 0,
        true,
        'All Environments must be deleted first.'
      );
    },
  },
};
