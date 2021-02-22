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
    serviceAccounts: {
        type: Text,
        isRequired: true,
    },
    permDomains: {
        type: Text,
        isRequired: true,
    },
    extRefId: {
        type: Text,
        isRequired: false,
    },
    members: { type: Relationship, isRequired: true, ref: 'MemberRole', many: true }
  },
  access: EnforcementPoint,
  plugins: [
    byTracking(),
    atTracking()
  ]
}
