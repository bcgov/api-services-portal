const { Text, Checkbox, Select, Relationship, Url, Password, Virtual } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking } = require('../components/ByTracking')

const { atTracking } = require('@keystonejs/list-plugins')

const { EnforcementPoint } = require('../authz/enforcement')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
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
    authPlugin: {
        type: Text,
        isRequired: false,
    },
    instruction: {
        type: Markdown,
        isRequired: false,
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
    clientRoles: {
        type: Text,
        isRequired: false,
    },
    availableScopes: {
        type: Text,
        isRequired: false,
    },
    apiKeyName: {
        type: Text,
        isRequired: false,
        defaultValue: 'X-API-KEY'
    },
    owner: { type: Relationship, ref: 'User', isRequired: true, many: false },
    environments: { type: Relationship, ref: 'Environment.credentialIssuer', many: true }
  },
  access: EnforcementPoint,
  plugins: [
    byTracking(),
    atTracking()
  ]
}
