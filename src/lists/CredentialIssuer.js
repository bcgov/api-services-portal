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
    authMethod: { type: Select, emptyOption: false, default: 'oidc', options: [
        { value: 'oidc', label: 'OIDC'},
        { value: 'keys', label: 'API Key'},
      ]
    },
    mode: { type: Select, emptyOption: false, default: 'auto', options: [
        { value: 'manual', label: 'Manual'},
        { value: 'auto', label: 'Automatic'},
      ]
    },
    instruction: {
        type: Virtual,
        resolver: item => `For OIDC, modes: Manual: will provide client id/secret in Request or direct.  Auto: Client Registration (Initial Access Token).  For API Key, the Key is generated, but option to be manual or automatic.`
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
    contact: { type: Relationship, ref: 'User', many: false },
    datasetGroups: { type: Relationship, ref: 'DatasetGroup.credentialIssuer', many: true }
  },
  access: EnforcementPoint,
  plugins: [
    byTracking(),
    atTracking()
  ]
}