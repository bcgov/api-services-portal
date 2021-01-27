const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

const { EnforcementPoint } = require('../authz/enforcement')

const { v4: uuidv4 } = require('uuid');

module.exports = {
  fields: {
    appId: {
        type: Text,
        isRequired: true,
        isUnique: true
    },
    name: {
        type: Text,
        isRequired: true,
    },
    description: {
        type: Text,
        isRequired: true,
        multiLine: true
    },
    owner: { type: Relationship, isRequired: true, ref: 'User' },
  },
  access: EnforcementPoint,
  hooks: {
    resolveInput: ({
        operation,
        existingItem,
        originalInput,
        resolvedData,
        context,
        listKey,
        fieldPath, // Field hooks only
    }) => {
        if (operation == "create") {
            resolvedData['appId'] = uuidv4().replace(/-/g,'').toUpperCase().substr(0, 20)
            return resolvedData
        }
    }
  },
  plugins: [
    byTracking(),
    atTracking()
  ]
}
