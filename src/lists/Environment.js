const { Text, Checkbox, Select, Relationship } = require('@keystonejs/fields');

const {
  newEnvironmentID,
  isEnvironmentID,
} = require('../services/identifiers');

const {
  ValidateActiveEnvironment,
  ApplyEnvironmentSetup,
} = require('../services/workflow');

const {
  FieldEnforcementPoint,
  EnforcementPoint,
} = require('../authz/enforcement');
const { logger } = require('../logger');
const {
  getAccountLinkUrl,
  getAllUserAccountLinks,
} = require('../services/workflow/apply-environment-setup');

const typeAccountLinking = `
type AccountLinking {
  environmentName: String!,
  productName: String!,
  brokerAlias: String!,
  issuerUrl: String!,
  linkedIdentities: [String]!,
  linkingUrl: String!
}
`;

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
        { value: 'kong-api-key-only', label: 'Kong API Key Only' },
        { value: 'kong-api-key-acl', label: 'Kong API Key with ACL Flow' },
      ],
    },

    legal: { type: Relationship, ref: 'Legal' },
    credentialIssuer: {
      type: Relationship,
      ref: 'CredentialIssuer.environments',
    },
    credentials: {
      type: Text,
      isRequired: false,
    },
    callbackUrl: {
      type: Text,
      isRequired: false,
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
  extensions: [
    (keystone) => {
      keystone.extendGraphQLSchema({
        types: [{ type: typeAccountLinking }],
        queries: [
          {
            schema: 'getAccountLinking(id: ID!): AccountLinking',
            resolver: async (item, args, context, info, { query, access }) => {
              const noauthContext = context.createContext({
                skipAccessControl: true,
              });
              noauthContext.req = context.req;

              const accountLinking = await getAccountLinkUrl(
                noauthContext,
                args.id,
                noauthContext.req.headers['referer']
              );

              logger.debug('[getAccountLinking] RESULT = %j', accountLinking);

              return {
                ...accountLinking,
                ...{
                  linkedIdentities: accountLinking.linkedIdentities.map(
                    (id) => id.userName
                  ),
                },
              };
            },
            access: EnforcementPoint,
          },
          {
            schema: 'getAllUserAccountLinks: [AccountLinking]',
            resolver: async (item, args, context, info, { query, access }) => {
              const noauthContext = context.createContext({
                skipAccessControl: true,
              });
              noauthContext.req = context.req;

              const accountLinking = await getAllUserAccountLinks(
                noauthContext,
                args.id,
                noauthContext.req.headers['referer']
              );

              logger.debug(
                '[getAllUserAccountLinks] RESULT = %j',
                accountLinking
              );

              return accountLinking;
            },
            access: EnforcementPoint,
          },
        ],

        /*
        queries: getEnvironmentClient() : Returns Environment with Credentials populated
        query: getAccountLinking(prodEnvironmentId) - see if the user has a linked account already, and if so use it
        query: Get the Account Linking URL (getAccountLinkUrl)
        mutation: boolean for re-generating credentials
        */
        mutations: [
          {
            schema:
              'updateEnvironmentClient(productEnvironmentId: ID!, callbackUrl: String!): Environment',
            resolver: async (item, args, context, info, { query, access }) => {
              const noauthContext = keystone.createContext({
                skipAccessControl: true,
              });

              return await ApplyEnvironmentSetup(
                noauthContext,
                args.productEnvironmentId,
                args.callbackUrl
              );
            },
            access: EnforcementPoint,
          },
        ],
      });
    },
  ],
};
