const { Relationship, Select, Slug, Text } = require('@keystonejs/fields');
const { atTracking } = require('@keystonejs/list-plugins');
const {
  FieldEnforcementPoint,
  EnforcementPoint,
} = require('../authz/enforcement');

const parseScopes = (value) => {
  const scopes = typeof value === 'string' ? JSON.parse(value) : value;
  if (!Array.isArray(scopes)) {
    throw new Error('scopes must be an array');
  }

  const normalized = scopes.map((scope) => {
    if (typeof scope !== 'string' || scope.trim().length === 0) {
      throw new Error('scopes must contain only nonblank strings');
    }
    return scope.trim();
  });

  return JSON.stringify(Array.from(new Set(normalized)).sort());
};

const relationshipId = (value) => {
  if (value && typeof value === 'object') {
    if (value.connect) {
      return value.connect.id || value.connect;
    }
    return value.id;
  }
  return value;
};

/*
 * A ConnectionClientGrant records the operation scopes approved for one CSS
 * OAuth client on a shared subsystem-to-service connection. The parent
 * ConnectionRequest remains the connection and gateway-resource identity.
 */
module.exports = {
  fields: {
    connection: {
      type: Relationship,
      ref: 'ConnectionRequest.grants',
      many: false,
      isRequired: true,
    },
    integrationId: {
      type: Text,
      isRequired: true,
      access: { update: false },
    },
    oauthClientId: {
      type: Text,
      isRequired: true,
      access: { update: false },
    },
    submissionId: {
      type: Text,
      isRequired: false,
    },
    requesterDetails: {
      type: Text,
      isRequired: true,
      defaultValue: '{}',
    },
    scopes: {
      type: Text,
      isRequired: true,
      defaultValue: '[]',
    },
    status: {
      type: Select,
      dataType: 'string',
      emptyOption: false,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
      ],
      defaultValue: 'pending',
      isRequired: true,
      access: FieldEnforcementPoint,
    },
    slug: {
      type: Slug,
      adminConfig: { isReadOnly: true },
      access: { update: false },
      generate: ({ resolvedData, existingItem }) => {
        const connection =
          'connection' in resolvedData
            ? resolvedData.connection
            : existingItem.connection;
        const integrationId =
          'integrationId' in resolvedData
            ? resolvedData.integrationId
            : existingItem.integrationId;
        const oauthClientId =
          'oauthClientId' in resolvedData
            ? resolvedData.oauthClientId
            : existingItem.oauthClientId;
        return `${relationshipId(
          connection
        )}::${integrationId}::${oauthClientId}`;
      },
      makeUnique: (value) => value,
      isUnique: true,
    },
  },
  access: EnforcementPoint,
  plugins: [atTracking()],
  hooks: {
    resolveInput: ({ operation, existingItem, resolvedData }) => {
      if (operation === 'update' && 'connection' in resolvedData) {
        const requestedConnection = relationshipId(resolvedData.connection);
        const existingConnection = relationshipId(existingItem.connection);
        if (String(requestedConnection) !== String(existingConnection)) {
          throw new Error('connection cannot be changed');
        }

        // The composite-key upsert includes the relationship in its input.
        // Once its identity has been verified, avoid an unnecessary write.
        delete resolvedData.connection;
      }

      for (const field of ['integrationId', 'oauthClientId']) {
        if (field in resolvedData) {
          if (
            typeof resolvedData[field] !== 'string' ||
            resolvedData[field].trim().length === 0
          ) {
            throw new Error(`${field} must not be blank`);
          }
          resolvedData[field] = resolvedData[field].trim();
        }
      }

      if ('scopes' in resolvedData) {
        const normalizedScopes = parseScopes(resolvedData.scopes);
        if (
          operation === 'update' &&
          normalizedScopes !== existingItem.scopes
        ) {
          // A requester can change its requested scopes, but only an explicit
          // provider decision can approve the new scope set.
          resolvedData.status = 'pending';
        }
        resolvedData.scopes = normalizedScopes;
      }

      if ('requesterDetails' in resolvedData) {
        const details =
          typeof resolvedData.requesterDetails === 'string'
            ? JSON.parse(resolvedData.requesterDetails)
            : resolvedData.requesterDetails;
        resolvedData.requesterDetails = JSON.stringify(details || {});
      }

      return resolvedData;
    },
  },
};
