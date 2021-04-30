const { Text, Checkbox, Select, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')
const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce')
const GrapesJSEditor = require('keystonejs-grapesjs-editor')

const { v4: uuidv4 } = require('uuid');

const { FieldEnforcementPoint, EnforcementPoint } = require('../authz/enforcement')

module.exports = {
  fields: {
    appId: {
        type: Text,
        isRequired: true,
        isUnique: false,
    },
    name: {
        type: Text,
        isRequired: true,
    },
    namespace: {
        type: Text,
        isRequired: true,
        access: FieldEnforcementPoint
    },
    description: {
      type: Markdown,
      isMultiline: true,
      isRequired: false,
    },
    dataset: { type: Relationship, ref: 'Dataset' },
    organization: { type: Relationship, ref: 'Organization' },
    organizationUnit: { type: Relationship, ref: 'OrganizationUnit' },
    environments: { type: Relationship, ref: 'Environment.product', many: true },
  },
  access: EnforcementPoint,
  hooks: {
    resolveInput: ({
        context,
        operation,
        resolvedData
    }) => {
        if (operation == "create") {
            // If an AppId is provided then don't bother creating one
            if ('appId' in resolvedData && resolvedData['appId'].length == 16) {
                return resolvedData
            } else {
                resolvedData['appId'] = uuidv4().replace(/-/g,'').toUpperCase().substr(0, 16)
            }
            resolvedData['namespace'] = context['authedItem']['namespace']
            return resolvedData
        }
        return resolvedData
    }
  },
}
