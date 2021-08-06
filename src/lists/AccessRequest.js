const { Text, Checkbox, Relationship } = require('@keystonejs/fields');
const { Markdown } = require('@keystonejs/fields-markdown');
const { byTracking } = require('../components/ByTracking');
const { atTracking } = require('@keystonejs/list-plugins');
const {
  FieldEnforcementPoint,
  EnforcementPoint,
} = require('../authz/enforcement');
const { Apply, Validate } = require('../services/workflow');
const {
  lookupEnvironmentAndApplicationByAccessRequest,
} = require('../services/keystone/access-request');
const {
  lookupCredentialIssuerById,
} = require('../services/keystone/credential-issuer');
const {
  doClientLoginForCredentialIssuer,
} = require('../lists/extensions/Common');
const { UMAResourceRegistrationService } = require('../services/uma2');
const keystoneApi = require('../services/keystone');
const { KeycloakPermissionTicketService } = require('../services/keycloak');
const {
  getSuitableOwnerToken,
  getEnvironmentContext,
  getResourceSets,
  getNamespaceResourceSets,
  isUserBasedResourceOwners,
} = require('../lists/extensions/Common');
const {
  lookupProductEnvironmentServicesBySlug,
} = require('../services/keystone');

const KeystoneService = require('../services/keystone');

module.exports = {
  fields: {
    name: {
      type: Text,
      isRequired: true,
    },
    communication: {
      type: Markdown,
      isRequired: false,
    },
    isApproved: {
      type: Checkbox,
      isRequired: false,
      default: false,
      access: FieldEnforcementPoint,
    },
    isIssued: {
      type: Checkbox,
      isRequired: false,
      default: false,
      access: FieldEnforcementPoint,
    },
    isComplete: {
      type: Checkbox,
      isRequired: false,
      default: false,
    },
    credential: {
      type: Text,
      isRequired: false,
    },
    controls: {
      type: Text,
      isRequired: true,
    },
    additionalDetails: {
      type: Text,
      isMultiline: true,
      isRequired: false,
    },
    requestor: { type: Relationship, isRequired: true, ref: 'User' },
    application: { type: Relationship, isRequired: false, ref: 'Application' },
    productEnvironment: {
      type: Relationship,
      isRequired: true,
      ref: 'Environment',
    },
    serviceAccess: {
      type: Relationship,
      isRequired: false,
      ref: 'ServiceAccess',
    },
  },
  access: EnforcementPoint,
  plugins: [byTracking(), atTracking()],
  hooks: {
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
      await Validate(
        context.createContext({ skipAccessControl: true }),
        operation,
        existingItem,
        originalInput,
        resolvedData,
        addValidationError
      );
    },
    beforeChange: ({
      operation,
      existingItem,
      originalInput,
      resolvedData,
      context,
      listKey,
      fieldPath, // exists only for field hooks
    }) => {},
    afterChange: async function ({
      operation,
      existingItem,
      originalInput,
      updatedItem,
      context,
      listKey,
      fieldPath, // exists only for field hooks
    }) {
      const noauthContext = context.createContext({ skipAccessControl: true });

      await Apply(
        noauthContext,
        operation,
        existingItem,
        originalInput,
        updatedItem
      );

      if (operation == 'create') {
        const accessRequest = await lookupEnvironmentAndApplicationByAccessRequest(
          noauthContext,
          updatedItem.id
        );
        console.log(
          'This is awesome namespace: ' +
            accessRequest.productEnvironment.product.namespace
        );
        const productEnvironmentSlug = process.env.GWA_PROD_ENV_SLUG;

        const prodEnv = await lookupProductEnvironmentServicesBySlug(
          noauthContext,
          productEnvironmentSlug
        );
        const envCtx = await getEnvironmentContext(context, prodEnv.id, '');

        console.log('This is envCtx: ', JSON.stringify(envCtx));

        const resourceIds = await getResourceSets(envCtx);
        const resourcesApi = new UMAResourceRegistrationService(
          envCtx.issuerEnvConfig.issuerUrl,
          envCtx.accessToken
        );
        const namespaces = await resourcesApi.listResourcesByIdList(
          resourceIds
        );
        const matched = namespaces
          .filter(
            (ns) =>
              ns.name == accessRequest.productEnvironment.product.namespace
          )
          .map((ns) => ({
            id: ns.id,
            name: ns.name,
            scopes: ns.resource_scopes,
            prodEnvId: prodEnv.id,
          }));
        namespaceObj = matched[0];
        console.log(
          'This is the same namespace: ' + JSON.stringify(namespaceObj)
        );
        const permissionApi = new KeycloakPermissionTicketService(
          envCtx.issuerEnvConfig.issuerUrl,
          envCtx.accessToken
        );
        const params = { resourceId: namespaceObj.id, returnNames: true };
        const permissions = await permissionApi.listPermissions(params);
        console.log('Permissions List: ' + JSON.stringify(permissions));
        permissions.forEach(async (user) => {
          console.log('User Name: ' + user.requesterName);
          console.log('User Scopes: ' + user.scopeName);
          const userResult = await noauthContext.executeGraphQL({
            query: `query GetUserWithUsername($username: String!) {
                            allUsers(where: {username: $username}) {
                                id
                                name
                                username
                                email
                            }
                        }`,
            variables: { username: user.requesterName },
          });

          console.log(
            'User object errors: ' + JSON.stringify(userResult.errors)
          );
          console.log(
            'This is the user object: ' +
              JSON.stringify(userResult.data.allUsers)
          );
        });
      }
    },
  },
};
