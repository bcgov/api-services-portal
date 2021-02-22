const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

const { EnforcementPoint } = require('../authz/enforcement')

module.exports = {
  fields: {
    query: {
        type: Text,
        isRequired: true
    },
    day: {
        type: Text,
        isRequired: true
    },
    metric: {
        type: Text,
        isRequired: true
    },
    values: {
        type: Text,
        isRequired: true
    },
    service: { type: Relationship, ref: 'GatewayService', many: false },
  },
  access: EnforcementPoint,
  plugins: [
    atTracking()
  ]
}
