const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

const { EnforcementPoint } = require('../authz/enforcement')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
        adminConfig: {
            isReadOnly: true
        }
    },
    kongRouteId: {
        type: Text,
        isRequired: true,
        adminConfig: {
            isReadOnly: true
        }
    },
    kongServiceId: {
        type: Text,
        isRequired: true,
        adminConfig: {
            isReadOnly: true
        }
    },
    namespace: {
        type: Text,
        isRequired: true,
        adminConfig: {
            isReadOnly: true
        }
    },
    host: {
        type: Text,
        isRequired: true,
        adminConfig: {
            isReadOnly: true
        }
    },
    isActive: {
        type: Checkbox,
        isRequired: false,
        adminConfig: {
            isReadOnly: true
        }
    },
    tags: {
        type: Text,
        isRequired: true,
        adminConfig: {
            isReadOnly: true
        }
    },
    plugins: { type: Relationship, ref: 'Plugin', many: true },

  },
  access: EnforcementPoint,
  plugins: [
    byTracking(),
    atTracking()
  ]
}
