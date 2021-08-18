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
  lookupUser,
  lookupProductEnvironmentServices,
  lookupUsersByNamespace,
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

      if (operation == 'update') {
        const prodEnvironment = await lookupProductEnvironmentServices(
          noauthContext,
          updatedItem.productEnvironment.toString()
        );
        if (prodEnvironment.approval) {
          if (updatedItem.credential == 'NEW' && !updatedItem.isComplete) {
            const accessRequest = await lookupEnvironmentAndApplicationByAccessRequest(
              noauthContext,
              updatedItem.id
            );
            const userContactList = await lookupUsersByNamespace(
              noauthContext,
              accessRequest.productEnvironment.product.namespace,
              'Access.Manage'
            );
            const nc = new NotificationService(new ConfigService());
            userContactList.forEach((contact) => {
              nc.notify(
                { email: contact.email, name: contact.name },
                {
                  template: 'access-rqst-notification',
                  subject: `Access Request - ${updatedItem.name}`,
                }
              )
                .then((answer) => {
                  console.log(
                    `[SUCCESS][${JSON.stringify(
                      answer
                    )}] Notification sent to ${contact.email}`
                  );
                })
                .catch((err) => {
                  console.log('[ERROR] Sending notification failed!' + err);
                });
            });
          } else if (updatedItem.isComplete) {
            const requestorDtls = await lookupUser(
              noauthContext,
              updatedItem.requestor.toString()
            );
            const nc = new NotificationService(new ConfigService());
            nc.notify(
              {
                email: requestorDtls[0]?.email,
                name: requestorDtls[0]?.name,
              },
              {
                template: updatedItem.isApproved
                  ? 'access-rqst-approved'
                  : 'access-rqst-rejected',
                subject: `Access Request - ${updatedItem.name}`,
              }
            )
              .then((answer) => {
                console.log(
                  `[SUCCESS][${JSON.stringify(answer)}] Notification sent to ${
                    requestorDtls[0]?.email
                  }`
                );
              })
              .catch((err) => {
                console.log('[ERROR] Sending notification failed!' + err);
              });
          }
        }
      }
    },
  },
};
