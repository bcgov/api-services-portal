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
const { UMAResourceRegistrationService } = require('../services/uma2');
const { KeycloakPermissionTicketService } = require('../services/keycloak');
const {
  getEnvironmentContext,
  getResourceSets,
} = require('../lists/extensions/Common');
const {
  lookupProductEnvironmentServicesBySlug,
  lookupUserByUsername,
} = require('../services/keystone');

const { ConfigService } = require('../services/config.service');
const {
  NotificationService,
} = require('../services/notification/notification.service');

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
        const userContactList = await noauthContext.executeGraphQL({
          query: `query ListUsersByNamespace($namespace: String!, $scopeName: String) {
                          usersByNamespace(namespace: $namespace, scopeName: $scopeName) {
                              id
                              name
                              username
                              email
                          }
                      }`,
          variables: {
            namespace: accessRequest.productEnvironment.product.namespace,
            scopeName: 'Access.Manage',
          },
        });
        const nc = new NotificationService(new ConfigService());
        userContactList.data.usersByNamespace.forEach((contact) => {
          nc.notify(
            { email: 'nithu.everyyear@gmail.com', name: contact.name },
            {
              template: 'access-rqst-notification',
              subject: 'New Access Request!',
            }
          )
            .then((answer) => {
              console.log(
                `[SUCCESS][${JSON.stringify(answer)}] Notification sent to ${
                  contact.email
                }`
              );
            })
            .catch((err) => {
              console.log('[ERROR] Sending notification failed!' + err);
            });
        });
      }
    },
  },
};
