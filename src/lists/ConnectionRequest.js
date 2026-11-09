const { Checkbox, Slug, Text, Relationship } = require('@keystonejs/fields');
const { atTracking } = require('@keystonejs/list-plugins');
const { v4: uuidv4 } = require('uuid');
const {
  FieldEnforcementPoint,
  EnforcementPoint,
} = require('../authz/enforcement');
const { UserAssertionError } = require('../services/user-assert');
const { SubsystemService } = require('../services/batch/subsystem');

const { logger } = require('../logger');
const { OpenAPISpecService } = require('../services/batch/oas-service');
const {
  ProvisionerService,
} = require('../services/provisioner/provisioner-service');
const {
  ConnectionRequestNotificationService,
} = require('../services/notification/connection-request-notification.service');

// Fire and forget, like the provisioner event: sending email must not hold up
// or fail the save. notifyChange logs its own failures; this is a safety net.
const notifyChange = (context, args) => {
  new ConnectionRequestNotificationService()
    .notifyChange({
      ...args,
      context: context.createContext({ skipAccessControl: true }),
    })
    .catch((err) => {
      logger.error('Connection request notification failed: %s', err);
    });
};

const parseProvisionerStatus = (value) => {
  if (typeof value !== 'string') {
    return value || {};
  }

  try {
    return JSON.parse(value || '{}');
  } catch {
    return {};
  }
};

const lifecycleStatus = (isActive) => {
  const provisioning = Boolean(isActive);
  return {
    status: provisioning ? 'pending' : 'deprovisioning',
    operation: provisioning ? 'provision' : 'deprovision',
    operationId: uuidv4(),
    message: provisioning
      ? 'Provisioning started.'
      : 'Deprovisioning started.',
  };
};

const operationMatches = (current, incoming) =>
  !current.operationId || current.operationId === incoming.operationId;

/*
Connection Request : For SDX this manages the lifecycle of a connection
between a consumer and provider.
*/
module.exports = {
  fields: {
    clientId: {
      type: Text,
      isRequired: true,
    },
    serviceId: {
      type: Text,
      isRequired: true,
    },
    clientOrganization: {
      type: Relationship,
      ref: 'Organization',
      access: { update: false },
    },
    serviceOrganization: {
      type: Relationship,
      ref: 'Organization',
      access: { update: false },
    },
    policyVersion: {
      type: Text,
      isRequired: true,
      access: FieldEnforcementPoint,
    },
    environment: {
      type: Text,
      isRequired: true,
      access: FieldEnforcementPoint,
    },
    isApproved: {
      type: Checkbox,
      isRequired: true,
      defaultValue: false,
      access: FieldEnforcementPoint,
    },
    isActive: {
      type: Checkbox,
      isRequired: true,
      defaultValue: false,
      access: FieldEnforcementPoint,
    },
    requesterDetails: {
      type: Text,
      isRequired: true,
      defaultValue: '{}',
      access: FieldEnforcementPoint,
    },
    clientResources: {
      type: Text,
      isRequired: true,
      defaultValue: '{}',
    },
    serviceResources: {
      type: Text,
      isRequired: true,
      defaultValue: '{}',
    },
    provisionerStatus: {
      type: Text,
      isRequired: true,
      defaultValue: '{}',
      access: FieldEnforcementPoint,
    },
    slug: {
      type: Slug,
      adminConfig: {
        isReadOnly: true,
      },
      access: { update: false },
      generate: ({ resolvedData, existingItem }) => {
        const clientId =
          'clientId' in resolvedData
            ? resolvedData['clientId']
            : existingItem['clientId'];
        const serviceId =
          'serviceId' in resolvedData
            ? resolvedData['serviceId']
            : existingItem['serviceId'];
        return `${clientId}::${serviceId}`;
      },
      makeUnique: (val) => val,
      isUnique: true,
    },
  },
  access: EnforcementPoint,
  plugins: [atTracking()],
  hooks: {
    resolveInput: async ({
      context,
      operation,
      originalInput,
      existingItem,
      resolvedData,
    }) => {
      logger.debug('Resolving input for ConnectionRequest: %j', resolvedData);

      if (originalInput && 'provisionerStatus' in originalInput) {
        const otherAttributes = Object.keys(originalInput).filter(
          (key) => !['clientId', 'serviceId', 'provisionerStatus'].includes(key)
        );
        if (otherAttributes.length > 0) {
          throw new Error(
            'provisionerStatus must be updated on its own, without any other attributes'
          );
        }

        const currentStatus = parseProvisionerStatus(
          existingItem && existingItem.provisionerStatus
        );
        const incomingStatus = parseProvisionerStatus(
          resolvedData.provisionerStatus
        );
        if (!operationMatches(currentStatus, incomingStatus)) {
          logger.info(
            'Ignoring stale provisioner status for operation %s; current operation is %s',
            incomingStatus.operationId || 'legacy',
            currentStatus.operationId
          );
          resolvedData.provisionerStatus = existingItem.provisionerStatus;
        }
      } else {
        const isActive =
          'isActive' in resolvedData
            ? resolvedData.isActive
            : Boolean(existingItem && existingItem.isActive);
        resolvedData.provisionerStatus = JSON.stringify(
          lifecycleStatus(isActive)
        );
      }

      if (operation !== 'create') {
        return resolvedData;
      }
      // lookup organization from clientId
      // lookup organization from serviceId
      // assign clientOrganization and serviceOrganization
      const service = new SubsystemService();
      const clientSubsystem = await service.findSubsystemByClientId(
        context,
        resolvedData.clientId
      );
      logger.debug(
        'Found client subsystem for clientId %s: %j',
        resolvedData.clientId,
        clientSubsystem
      );

      const oasService = new OpenAPISpecService();
      const serviceSpec = await oasService.findOpenAPISpecByName(
        context,
        resolvedData.serviceId
      );
      if (!serviceSpec) {
        throw new Error('Invalid serviceId');
      }

      logger.debug(
        'Found spec for serviceId %s: %j',
        resolvedData.serviceId,
        serviceSpec
      );

      if (!clientSubsystem || !serviceSpec) {
        throw new Error('Invalid clientId or serviceId');
      }

      resolvedData.clientOrganization = clientSubsystem
        ? Number(clientSubsystem.organization.id)
        : null;

      resolvedData.serviceOrganization = serviceSpec
        ? Number(serviceSpec.organization.id)
        : null;

      return resolvedData;
    },

    beforeDelete: async function ({ existingItem, context }) {
      logger.debug(
        'Before delete hook for ConnectionRequest: existingItem=%j',
        existingItem
      );

      if (existingItem.isActive) {
        throw new UserAssertionError(
          'Cannot revoke an active connection. Deactivate it and wait for access configuration removal to finish.'
        );
      }

      if (existingItem.isApproved) {
        const provisionerStatus = parseProvisionerStatus(
          existingItem.provisionerStatus
        );

        if (provisionerStatus.status !== 'deprovisioned') {
          throw new UserAssertionError(
            'Cannot revoke this connection until its access configuration has been removed. Deactivate it and wait for access configuration removal to finish.'
          );
        }
      }
    },

    afterDelete: async function ({ operation, existingItem, context }) {
      notifyChange(context, { operation, existingItem });
    },

    afterChange: async function ({
      operation,
      existingItem,
      originalInput,
      updatedItem,
      context,
    }) {
      logger.debug(
        'After change hook for ConnectionRequest: operation=%s, updatedItem=%j',
        operation,
        updatedItem
      );
      if (originalInput && 'provisionerStatus' in originalInput) {
        logger.debug(
          'Skipping provisioner callback because provisionerStatus was supplied directly'
        );
        return;
      }
      const provisionerService = new ProvisionerService(
        process.env.PROVISIONER_URL
      );
      await provisionerService.postConnectionRequestChangeEvent(
        updatedItem,
        updatedItem.isActive ? 'apply' : 'delete'
      );

      notifyChange(context, {
        operation,
        existingItem,
        originalInput,
        updatedItem,
      });
    },
  },
};
