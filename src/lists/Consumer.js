const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

const { EnforcementPoint } = require('../authz/enforcement')

module.exports = {
  fields: {
    username: {
        type: Text,
        isRequired: true,
        isUnique: true,
        adminConfig: {
            isReadOnly: true
        }
    },
    customId: {
        type: Text,
        isRequired: false,
        adminConfig: {
            isReadOnly: true
        }
    },
    kongConsumerId: {
        type: Text,
        isRequired: false,
        adminConfig: {
            isReadOnly: true
        }
    },
    namespace: {
        type: Text,
        isRequired: false,
        adminConfig: {
            isReadOnly: true
        }
    },
    tags: {
        type: Text,
        isRequired: false,
        adminConfig: {
            isReadOnly: true
        }
    },
    plugins: { type: Relationship, ref: 'Plugin', many: true }
  },
  access: EnforcementPoint,
  plugins: [
    byTracking(),
    atTracking()
  ]

}
