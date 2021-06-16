const { Text, Checkbox, Select, Relationship } = require('@keystonejs/fields');

const {
  newEnvironmentID,
  isEnvironmentID,
} = require('../services/identifiers');

const { ValidateActiveEnvironment } = require('../services/workflow');

const {
  FieldEnforcementPoint,
  EnforcementPoint,
} = require('../authz/enforcement');

module.exports = {
  fields: {
    appId: {
      type: Text,
      isRequired: true,
      isUnique: true,
      access: {
        create: true,
        update: false,
      },
    },
    name: {
      type: Text,
      isRequired: true,
    },
    active: {
      type: Checkbox,
      isRequired: true,
      defaultValue: false,
      access: FieldEnforcementPoint,
    },
    approval: {
      type: Checkbox,
      isRequired: true,
      defaultValue: false,
    },
    flow: {
      type: Select,
      emptyOption: false,
      dataType: 'string',
      defaultValue: 'public',
      options: [
        { value: 'public', label: 'Public' },
        {
          value: 'authorization-code',
          label: 'Oauth2 Authorization Code Flow',
        },
        {
          value: 'client-credentials',
          label: 'Oauth2 Client Credentials Flow',
        },
        { value: 'kong-acl-only', label: 'Kong ACL Only' },
        { value: 'kong-api-key-acl', label: 'Kong API Key with ACL Flow' },
      ],
    },

    legal: { type: Relationship, ref: 'Legal' },
    credentialIssuer: {
      type: Relationship,
      ref: 'CredentialIssuer.environments',
    },
    additionalDetailsToRequest: {
      type: Text,
      isMultiline: true,
      isRequired: false,
    },
    services: {
      type: Relationship,
      ref: 'GatewayService.environment',
      many: true,
    },
    product: { type: Relationship, ref: 'Product.environments', many: false },
  },
  access: EnforcementPoint,
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
      if (operation == 'create') {
        if ('appId' in resolvedData && isEnvironmentID(resolvedData['appId'])) {
        } else {
          resolvedData['appId'] = newEnvironmentID();
        }
      }
      return resolvedData;
    },
    validateInput: async function ({
      operation,
      existingItem,
      originalInput,
      resolvedData,
      context,
      addFieldValidationError, // Field hooks only
      addValidationError, // List hooks only
      listKey,
      fieldPath, // Field hooks only
    }) {
      console.log(
        'VALIDATE ' + operation + ' ' + JSON.stringify(existingItem, null, 3)
      );
      console.log(
        'VALIDATE ' + operation + ' ' + JSON.stringify(originalInput, null, 3)
      );
      console.log(
        'VALIDATE ' + operation + ' ' + JSON.stringify(resolvedData, null, 3)
      );
      await ValidateActiveEnvironment(
        context,
        operation,
        existingItem,
        originalInput,
        resolvedData,
        addValidationError
      );
    },
  },
};
