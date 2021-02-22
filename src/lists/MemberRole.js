const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

const { EnforcementPoint } = require('../authz/enforcement')

module.exports = {
  fields: {
    role: {
        type: Text,
        isRequired: true,
    },
    extRefId: {
        type: Text,
        isRequired: false,
    },
    user: { type: Relationship, isRequired: true, ref: 'User', many: false }
  },
  access: EnforcementPoint,
  plugins: [
    byTracking(),
    atTracking()
  ]
}
