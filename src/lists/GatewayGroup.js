const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { externallySourced } = require('../components/ExternalSource')

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
    // extRefId: {
    //     type: Text,
    //     isRequired: true,
    //     isUnique: true,
    //     adminConfig: {
    //         isReadOnly: false
    //     }
    // },
    namespace: {
        type: Text,
        isRequired: true,
        adminConfig: {
            isReadOnly: false
        }
    }
  },
  access: EnforcementPoint,
  plugins: [
    externallySourced(),
    atTracking()
  ]
}
