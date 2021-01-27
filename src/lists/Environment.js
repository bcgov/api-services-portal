const { Text, Checkbox, Select, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')
const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce')
const GrapesJSEditor = require('keystonejs-grapesjs-editor')

const { EnforcementPoint } = require('../authz/enforcement')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
    },
    active: {
        type: Checkbox,
        isRequired: true,
        defaultValue: false
    },
    authMethod: { type: Select, emptyOption: false, defaultValue: 'public', options: [
        { value: 'private', label: 'Private'},
        { value: 'public', label: 'Public'},
        { value: 'JWT', label: 'JWT'},
        { value: 'keys', label: 'API Keys'},
      ]
    },
    plugins: { type: Relationship, ref: 'Plugin', many: true },
    description: {
      type: Text,
      isMultiline: true,
      isRequired: false,
    },
    credentialIssuer: { type: Relationship, ref: 'CredentialIssuer.environments' },
    services: { type: Relationship, ref: 'ServiceRoute.environment', many: true },
    package: { type: Relationship, ref: 'Package.environments', many: false },
  },
  access: EnforcementPoint,
  hooks: {
    validateInput: ({
        operation,
        existingItem,
        originalInput,
        resolvedData,
        context,
        addFieldValidationError, // Field hooks only
        addValidationError, // List hooks only
        listKey,
        fieldPath, // Field hooks only
    }) => {
        console.log("VALIDATE " + operation + " " + JSON.stringify(existingItem, null, 3));
        console.log("VALIDATE " + operation + " " + JSON.stringify(originalInput, null, 3));
        console.log("VALIDATE " + operation + " " + JSON.stringify(resolvedData, null, 3));
        if ('active' in originalInput) {
            // do validation
            if (Object.keys(originalInput).length != 1) {
                addValidationError("You can not update other data when changing the active status")
            } else {
                // validations:
                // - there is at least on service associated with it
                // - if prod, that it has a BCDC record
                if (originalInput['active'] == true && existingItem['name'] == "dev") {
                    addValidationError("Failed validation.  Not able to activate prod because of a good reason!")
                }
            }
        }
    }
  }
}
