const { Text, Relationship } = require('@keystonejs/fields');
const { EnforcementPoint } = require('../authz/enforcement');

function relationshipId(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return undefined;
  return value.id || value.connect?.id;
}

function queryContext(context) {
  return typeof context.sudo === 'function' ? context.sudo() : context;
}

async function listSubsystemIntegrations(context, subsystemId) {
  const result = await queryContext(context).executeGraphQL({
    query: `query SubsystemIntegrations($subsystemId: ID!) {
      allSubsystemIntegrations(where: { subsystem: { id: $subsystemId } }) {
        id
        integrationClientId
      }
    }`,
    variables: { subsystemId },
  });
  if (result.errors?.length) {
    throw result.errors[0];
  }
  return result.data?.allSubsystemIntegrations || [];
}

async function lookupSubsystemId(context, integrationId) {
  if (!integrationId) return undefined;
  const result = await queryContext(context).executeGraphQL({
    query: `query SubsystemIntegrationOwner($integrationId: ID!) {
      allSubsystemIntegrations(where: { id: $integrationId }, first: 1) {
        subsystem { id }
      }
    }`,
    variables: { integrationId },
  });
  if (result.errors?.length) {
    throw result.errors[0];
  }
  return result.data?.allSubsystemIntegrations?.[0]?.subsystem?.id;
}

/**
 * SubsystemIntegration manages the linking of a subsystem to an integration OAuth client.
 * The integrationClientId for the consumer is passed along in the integrationAccessRequest
 * IntegrationAccessRequests are put on hold until the consumer has been linked to a subsystem.
 * OpenAPISpecs published for Common SSO will not be eligible if linking incomplete.
 *
 * These records must be approved by the SDX Operator, until there is a process for securely linking
 * the two identifiers.
 * A subsystem is able to self-link to an integration client, but the record will be created with "isApproved" as false until an SDX Operator approves the linking.
 *
 */
module.exports = {
  fields: {
    integrationClientId: {
      type: Text,
      isRequired: true,
      isUnique: true,
    },
    subsystem: {
      type: Relationship,
      ref: 'Subsystem.integrations',
      many: false,
      access: { update: false },
    },
  },
  access: EnforcementPoint,
  hooks: {
    resolveInput: async ({ resolvedData }) => {
      // if integrationClientId is a number, convert to string
      if (typeof resolvedData.integrationClientId === 'number') {
        resolvedData.integrationClientId = resolvedData.integrationClientId.toString();
      }
      return resolvedData;
    },
    validateInput: async ({
      context,
      operation,
      resolvedData,
      existingItem,
    }) => {
      if (!['create', 'update'].includes(operation)) return;

      const subsystemId =
        relationshipId(resolvedData.subsystem) ||
        relationshipId(existingItem?.subsystem) ||
        (await lookupSubsystemId(context, existingItem?.id));
      if (!subsystemId) {
        throw new Error(
          'Unable to validate one-to-one CSS integration mapping because no subsystem ID was resolved'
        );
      }

      const records = await listSubsystemIntegrations(context, subsystemId);
      const conflicting = records.filter(
        (record) => record.id !== existingItem?.id
      );
      if (conflicting.length > 0) {
        throw new Error(
          `Subsystem '${subsystemId}' already has a CSS integration; only one integration is allowed`
        );
      }
    },
  },
};
