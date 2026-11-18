const { Checkbox, Slug, Text, Relationship } = require('@keystonejs/fields');
const { atTracking } = require('@keystonejs/list-plugins');
const { v4: uuidv4 } = require('uuid');
const {
  FieldEnforcementPoint,
  EnforcementPoint,
} = require('../authz/enforcement');
const { UserAssertionError } = require('../services/user-assert');
const {
  lifecycleActionError,
  parseJsonObject,
} = require('../services/batch/connection-lifecycle');
const {
  updateConnectionProvisionerStatus,
} = require('../services/batch/connection-status');
const { recordActivityWithBlob } = require('../services/keystone/activity');
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

const lifecycleStatus = (isActive, operationId) => {
  const provisioning = Boolean(isActive);
  return {
    status: provisioning ? 'pending' : 'deprovisioning',
    operation: provisioning ? 'provision' : 'deprovision',
    operationId: operationId || uuidv4(),
    message: provisioning ? 'Provisioning started.' : 'Deprovisioning started.',
  };
};

const provisionerDispatchFailureStatus = (value) => {
  const started = parseProvisionerStatus(value);
  const deprovisioning = started.operation === 'deprovision';
  return JSON.stringify({
    ...started,
    status: 'failed',
    message: deprovisioning
      ? 'Deprovisioning could not start because the provisioner could not be reached. Retry the operation.'
      : 'Provisioning could not start because the provisioner could not be reached. Retry the operation.',
  });
};

const operationMatches = (current, incoming) =>
  !current.operationId || current.operationId === incoming.operationId;

const startsInactiveWithoutAccess = (operation, existingItem, resolvedData) => {
  const isActive =
    'isActive' in resolvedData
      ? resolvedData.isActive
      : Boolean(existingItem && existingItem.isActive);
  if (isActive) {
    return false;
  }

  if (operation === 'create') {
    return true;
  }

  const currentStatus = parseProvisionerStatus(
    existingItem && existingItem.provisionerStatus
  );
  return (
    !existingItem.isApproved &&
    !existingItem.isActive &&
    currentStatus.status === 'deprovisioned'
  );
};

const PROVISIONING_FIELDS = new Set([
  'isApproved',
  'isActive',
  'policyVersion',
  'environment',
  'requesterDetails',
  'clientResources',
  'serviceResources',
]);

const inputKeys = (input) =>
  Object.keys(input || {}).filter(
    (key) => !['clientId', 'serviceId'].includes(key)
  );

const startsLifecycleOperation = (
  operation,
  existingItem,
  originalInput,
  resolvedData
) => {
  if (operation === 'create') return Boolean(resolvedData.isActive);
  const intent = parseJsonObject(
    resolvedData.lifecycleIntent ||
      (existingItem && existingItem.lifecycleIntent)
  );
  if (
    originalInput &&
    'lifecycleIntent' in originalInput &&
    intent.action &&
    intent.phase !== 'delete'
  ) {
    return true;
  }
  if (!inputKeys(originalInput).some((key) => PROVISIONING_FIELDS.has(key))) {
    return false;
  }
  const active =
    'isActive' in resolvedData
      ? resolvedData.isActive
      : Boolean(existingItem && existingItem.isActive);
  // Configuration changes are applied immediately only when the approved
  // connection is currently active. Inactive approved connections retain the
  // promoted configuration until an explicit Activate action.
  return Boolean(active);
};

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
    proposedConfiguration: {
      type: Text,
      isRequired: true,
      defaultValue: '{}',
      access: FieldEnforcementPoint,
    },
    lifecycleIntent: {
      type: Text,
      isRequired: true,
      defaultValue: '{}',
      access: FieldEnforcementPoint,
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
      existingItem,
      originalInput,
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
        } else {
          const intent = parseJsonObject(
            existingItem && existingItem.lifecycleIntent
          );
          if (
            intent.action &&
            intent.action !== 'revoke' &&
            ['provisioned', 'deprovisioned'].includes(incomingStatus.status)
          ) {
            resolvedData.lifecycleIntent = '{}';
          }
        }
      } else if (
        startsInactiveWithoutAccess(operation, existingItem, resolvedData)
      ) {
        // A new pending request, or new request metadata on a connection whose
        // access was already removed, has nothing to deprovision.
        resolvedData.provisionerStatus = '{}';
      } else if (
        startsLifecycleOperation(
          operation,
          existingItem,
          originalInput,
          resolvedData
        )
      ) {
        const isActive =
          'isActive' in resolvedData
            ? resolvedData.isActive
            : Boolean(existingItem && existingItem.isActive);
        const intent = parseJsonObject(
          resolvedData.lifecycleIntent ||
            (existingItem && existingItem.lifecycleIntent)
        );
        resolvedData.provisionerStatus = JSON.stringify(
          lifecycleStatus(isActive, intent.operationId)
        );
      }

      if (
        operation === 'update' &&
        existingItem &&
        originalInput &&
        typeof originalInput.isActive === 'boolean' &&
        originalInput.isActive !== Boolean(existingItem.isActive)
      ) {
        const intent = parseJsonObject(
          resolvedData.lifecycleIntent || existingItem.lifecycleIntent
        );
        const initialApproval =
          existingItem.isApproved === false &&
          originalInput.isApproved === true;
        if (intent.action && !initialApproval) {
          const policyError = lifecycleActionError(
            existingItem,
            intent.action,
            {
              confirmAbandonRevoke: intent.confirmAbandonRevoke,
            }
          );
          if (policyError) {
            throw new UserAssertionError(policyError);
          }
        }
        if (!intent.action && !initialApproval) {
          throw new UserAssertionError(
            'Use the explicit Activate, Deactivate, Retry, or Revoke connection action to change runtime access.'
          );
        }
      }

      if (
        operation === 'update' &&
        existingItem?.isApproved === true &&
        originalInput?.isApproved === false &&
        typeof originalInput?.isActive === 'boolean' &&
        originalInput.isActive !== Boolean(existingItem.isActive)
      ) {
        throw new UserAssertionError(
          'Cannot activate or deactivate a connection while marking an approved connection for re-approval. Existing access must be preserved; activate, deactivate, or revoke it separately.'
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

      if (!existingItem.isApproved && existingItem.isActive) {
        throw new UserAssertionError(
          'Cannot reject changes by deleting an active connection. Existing access must be preserved; revoke the connection separately.'
        );
      }

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
      if (
        startsInactiveWithoutAccess(operation, existingItem, updatedItem) ||
        !startsLifecycleOperation(
          operation,
          existingItem,
          originalInput,
          updatedItem
        )
      ) {
        logger.debug(
          'Skipping provisioner callback because the update does not start a runtime lifecycle operation'
        );
        notifyChange(context, {
          operation,
          existingItem,
          originalInput,
          updatedItem,
        });
        return;
      }
      const provisionerService = new ProvisionerService(
        process.env.PROVISIONER_URL
      );
      const lifecycleIntent = parseJsonObject(updatedItem.lifecycleIntent);
      const startedStatus =
        typeof updatedItem.provisionerStatus === 'string'
          ? updatedItem.provisionerStatus
          : JSON.stringify(updatedItem.provisionerStatus || {});
      const lifecycleContext = context.createContext({
        skipAccessControl: true,
      });
      await provisionerService.postConnectionRequestChangeEvent(
        updatedItem,
        updatedItem.isActive ? 'apply' : 'delete',
        lifecycleIntent.action === 'revoke',
        async () => {
          const result = await updateConnectionProvisionerStatus(
            lifecycleContext.keystoneAdapter,
            updatedItem.id,
            startedStatus,
            provisionerDispatchFailureStatus(startedStatus)
          );
          if (!result || result.status >= 400) {
            throw new Error(
              'Unable to persist the failed provisioner dispatch status.'
            );
          }
          const action =
            lifecycleIntent.action ||
            (updatedItem.isActive ? 'activate' : 'deactivate');
          try {
            await recordActivityWithBlob(
              lifecycleContext,
              action,
              'ConnectionRequest',
              updatedItem.id,
              `Connection ${updatedItem.clientId} -> ${updatedItem.serviceId} ${action} dispatch failed.`,
              'failed',
              JSON.stringify({
                message:
                  'Connection {client} -> {service} {action} dispatch failed',
                params: {
                  client: updatedItem.clientId,
                  service: updatedItem.serviceId,
                  action,
                },
              }),
              {
                action,
                operationId: parseProvisionerStatus(startedStatus).operationId,
                phase: 'dispatch',
              },
              [
                ...(updatedItem.serviceOrganization?.name ||
                updatedItem.clientOrganization?.name
                  ? [
                      `org:${
                        updatedItem.serviceOrganization?.name ||
                        updatedItem.clientOrganization?.name
                      }`,
                    ]
                  : []),
                `sdxClient:${updatedItem.clientId}`,
                `sdxService:${updatedItem.serviceId}`,
              ]
            );
          } catch (activityError) {
            logger.error(
              'Unable to record provisioner dispatch failure activity: %s',
              activityError
            );
          }
        }
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
