const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

const { EnforcementPoint } = require('../authz/enforcement')

const { v4: uuidv4 } = require('uuid');

const { DeleteAccess } = require('../servicests/workflow')

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
    organization: { type: Relationship, ref: 'Organization' },
    organizationUnit: { type: Relationship, ref: 'OrganizationUnit' },
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
            // If an AppId is provided then don't bother creating one
            if ('appId' in resolvedData && resolvedData['appId'].length == 16) {
                return resolvedData
            }
            resolvedData['appId'] = uuidv4().replace(/-/g,'').toUpperCase().substr(0, 16)
            return resolvedData
        }
    },
    beforeDelete: (async function ({
        operation,
        existingItem,
        context,
        listKey,
        fieldPath, // exists only for field hooks
      }) {
        console.log("BEFORE DELETE APP " + operation + " " + JSON.stringify(existingItem, null, 3));

        await DeleteAccess(context, operation, {application: existingItem.id})
    })

  },
  plugins: [
    atTracking()
  ]
}
