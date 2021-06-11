const { Text, Relationship } = require('@keystonejs/fields');
const { Markdown } = require('@keystonejs/fields-markdown');
const { newProductID, isProductID } = require('../services/identifiers');
const {
  FieldEnforcementPoint,
  EnforcementPoint,
} = require('../authz/enforcement');
const { logger } = require('../logger');

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
      access: FieldEnforcementPoint,
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
        if ('authedItem' in context && 'namespace' in context['authedItem']) {
          resolvedData['namespace'] = context['authedItem']['namespace'];
        }
      }
      logger.debug('[List.Product] Resolved %j', resolvedData);
      return resolvedData;
    },
  },
};
