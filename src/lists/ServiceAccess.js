const { Select, Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking } = require('../components/ByTracking')

const { atTracking } = require('@keystonejs/list-plugins')

const { FieldEnforcementPoint, EnforcementPoint } = require('../authz/enforcement');
const workflow = require('../services/workflow')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
        isUnique: true
    },
    active: {
        type: Checkbox,
        isRequired: true,
        default: false
    },
    aclEnabled: {
        type: Checkbox,
        isRequired: true,
        default: false
    },
    consumerType: { type: Select, emptyOption: false, defaultValue: 'client', options: [
        { value: 'client', label: 'Application'},
        { value: 'user', label: 'User'}
      ]
    },
    credentialReference: {
        type: Text,
        isRequired: false,
    },
    credential: {
        type: Text,
        isRequired: false,
    },
    clientRoles: {
        type: Text,
        isRequired: false,
    },
    consumer: { type: Relationship, isRequired: true, ref: 'GatewayConsumer' },
    application: { type: Relationship, isRequired: false, ref: 'Application' },
    productEnvironment: { type: Relationship, isRequired: true, ref: 'Environment' }
  },
  access: EnforcementPoint,
  plugins: [
    atTracking()
  ],
}
