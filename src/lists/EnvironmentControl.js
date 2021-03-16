const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

const { EnforcementPoint } = require('../authz/enforcement')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
    },
    config: {
        type: Text,
        isRequired: true,
    },
    service: { type: Relationship, ref: 'GatewayService', isRequired: false, many: false },
    route: { type: Relationship, ref: 'GatewayRoute', isRequired: false, many: false }
  },
  access: EnforcementPoint,
  plugins: [
    atTracking()
  ]
}
