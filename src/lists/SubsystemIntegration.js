const { Text, Relationship } = require('@keystonejs/fields');
const { EnforcementPoint } = require('../authz/enforcement');
const { atTracking } = require('@keystonejs/list-plugins');

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
  },
  access: EnforcementPoint,
};
