const { Checkbox, Slug, Text, Relationship } = require('@keystonejs/fields');
const { atTracking } = require('@keystonejs/list-plugins');
const {
  FieldEnforcementPoint,
  EnforcementPoint,
} = require('../authz/enforcement');
const { SubsystemService } = require('../services/batch/subsystem');
const {
  ExtractClientIdFromServiceId,
} = require('../services/gateway-patterns/catalog');

const { logger } = require('../logger');
const { OpenAPISpecService } = require('../services/batch/oas-service');
const { ConnectionService } = require('../services/batch/connection-service');

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
    isApproved: {
      type: Checkbox,
      isRequired: true,
      defaultValue: false,
      access: FieldEnforcementPoint,
    },
    isActive: {
      type: Checkbox,
      isRequired: true,
      defaultValue: true,
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
  },
};
