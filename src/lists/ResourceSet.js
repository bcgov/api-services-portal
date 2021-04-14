const { Text, Checkbox, Relationship } = require('@keystonejs/fields')

const { externallySourced } = require('../components/ExternalSource')

const { EnforcementPoint } = require('../authz/enforcement')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
    },
    displayName: {
        type: Text,
        isRequired: false,
    },
    type: {
        type: Text,
        isRequired: false,
    },
    uri: {
        type: Text,
        isRequired: false,
    },
    scopes: {
        type: Text,
        isRequired: false,
    },
  },
  access: EnforcementPoint,
  plugins: [
    externallySourced(),
  ]
}
