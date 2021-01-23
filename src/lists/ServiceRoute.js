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
            isReadOnly: false
        }
    },
    kongRouteId: {
        type: Text,
        isRequired: true,
        adminConfig: {
            isReadOnly: false
        }
    },
    kongServiceId: {
        type: Text,
        isRequired: true,
        adminConfig: {
            isReadOnly: false
        }
    },
    namespace: {
        type: Text,
        isRequired: true,
        adminConfig: {
            isReadOnly: false
        }
    },
    methods: {
        type: Text,
        isRequired: false,
        adminConfig: {
            isReadOnly: false
        }
    },
    paths: {
        type: Text,
        isRequired: false,
        adminConfig: {
            isReadOnly: false
        }
    },
    host: {
        type: Text,
        isRequired: true,
        adminConfig: {
            isReadOnly: false
        }
    },
    isActive: {
        type: Checkbox,
        isRequired: false,
        adminConfig: {
            isReadOnly: false
        }
    },
    tags: {
        type: Text,
        isRequired: true,
        adminConfig: {
            isReadOnly: false
        }
    },
    plugins: { type: Relationship, ref: 'Plugin', many: true },
    environment: { type: Relationship, ref: 'Environment.services', many: false },
  },
  access: EnforcementPoint,
  plugins: [
    byTracking(),
    atTracking()
  ]
}
