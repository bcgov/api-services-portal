const { Text, Checkbox, Select, Relationship, Url, Password, Virtual } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking } = require('../components/ByTracking')

const { atTracking } = require('@keystonejs/list-plugins')

const { EnforcementPoint, FieldEnforcementPoint } = require('../authz/enforcement')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
        isUnique: true
    },
    namespace: {
        type: Text,
        isRequired: true,
        access: FieldEnforcementPoint
    },
    description: {
        type: Markdown,
        isRequired: false,
    },
    flow: { type: Select, emptyOption: false, dataType: 'string', defaultValue: 'public', options: [
        { value: 'public', label: 'Public'},
        { value: 'authorization-code', label: 'Oauth2 Authorization Code Flow'},
        { value: 'client-credentials', label: 'Oauth2 Client Credentials Flow'},
        { value: 'kong-api-key-acl', label: 'Kong API Key with ACL Flow'},
      ]
    },
    clientRegistration: { type: Select, emptyOption: true, dataType: 'string', options: [
        { value: 'anonymous', label: 'Anonymous'},
        { value: 'managed', label: 'Managed'},
        { value: 'iat', label: 'Initial Access Token'}
      ]
    },
    mode: { type: Select, emptyOption: false, dataType: 'string', defaultValue: 'manual', options: [
        { value: 'manual', label: 'Manual'},
        { value: 'auto', label: 'Automatic'},
      ]
    },
    clientAuthenticator: { type: Select, emptyOption: true, dataType: 'string', options: [
        { value: 'client-secret', label: 'Client ID and Secret'},
        { value: 'client-jwt', label: 'Signed JWT'},
      ]
    },
    authPlugin: {
        type: Text,
        isRequired: false,
    },
    instruction: {
        type: Markdown,
        isRequired: false,
    },
    environmentDetails: {
        type: Text,
        isRequired: true
    },
    oidcDiscoveryUrl: {
        type: Url,
        isRequired: false,
        views: '../admin/fieldViews/link'
    },
    initialAccessToken: {
        type: Text,
        isMultiline: true,
        isRequired: false,
    },
    clientId: {
        type: Text,
        isRequired: false,
    },
    clientSecret: {
        type: Text,
        isRequired: false,
    },
    availableScopes: {
        type: Text,
        isRequired: false,
    },
    clientRoles: {
        type: Text,
        isRequired: false,
    },
    resourceScopes: {
        type: Text,
        isRequired: false,
    },
    resourceType: {
        type: Text,
        isRequired: false,
    },
    resourceAccessScope: {
        type: Text,
        isRequired: false,
    },
    apiKeyName: {
        type: Text,
        isRequired: false,
        defaultValue: 'X-API-KEY'
    },
    owner: { type: Relationship, ref: 'User', isRequired: true, many: false, access: { update: false } },
    environments: { type: Relationship, ref: 'Environment.credentialIssuer', many: true }
  },
  access: EnforcementPoint,
  plugins: [
    byTracking(),
    atTracking()
  ],
  hooks: {
    resolveInput: ({
        operation,
        resolvedData,
        context,
    }) => {
        if (operation == "create" && !('owner' in resolvedData)) {
            resolvedData['owner'] = context.authedItem.userId
        }
        return resolvedData
    }
  }  
}
