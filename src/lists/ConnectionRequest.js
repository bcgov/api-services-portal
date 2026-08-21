const { Checkbox, Slug, Text, Relationship } = require('@keystonejs/fields');
const { atTracking } = require('@keystonejs/list-plugins');
const {
  FieldEnforcementPoint,
  EnforcementPoint,
} = require('../authz/enforcement');
const { UserAssertionError } = require('../services/user-assert');
const { SubsystemService } = require('../services/batch/subsystem');
const {
  ExtractClientIdFromServiceId,
} = require('../services/gateway-patterns/catalog');

const { logger } = require('../logger');
const { OpenAPISpecService } = require('../services/batch/oas-service');
const { ConnectionService } = require('../services/batch/connection-service');
const {
  ProvisionerService,
} = require('../services/provisioner/provisioner-service');
const {
  shouldNotifyProvisioner,
} = require('../services/provisioner/connection-change');

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
    resolveInput: async ({ context, operation, resolvedData }) => {
      logger.debug('Resolving input for ConnectionRequest: %j', resolvedData);
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
          'Cannot delete an active connection request. Please set isActive to false before deleting.'
        );
      }
    },

    afterChange: async function ({ operation, existingItem, updatedItem }) {
      logger.debug(
        'After change hook for ConnectionRequest: operation=%s, updatedItem=%j',
        operation,
        updatedItem
      );
      if (!shouldNotifyProvisioner(operation, existingItem, updatedItem)) {
        logger.debug(
          'Skipping provisioner callback because provisioning fields did not change'
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
    },
  },
};
