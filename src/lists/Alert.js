const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

const { EnforcementPoint } = require('../authz/enforcement')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true
    },
    state: {
        type: Text,
        isRequired: false
    },
    description: {
        type: Text,
        isRequired: false
    },
    service: { type: Relationship, ref: 'GatewayService', many: false },
  },
  access: EnforcementPoint,
  plugins: [
    atTracking()
  ]
}
