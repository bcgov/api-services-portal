const { Text, Checkbox, Select, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')
const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce')
const GrapesJSEditor = require('keystonejs-grapesjs-editor')

const { FieldEnforcementPoint, EnforcementPoint } = require('../authz/enforcement')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
    },
    active: {
        type: Checkbox,
        isRequired: true,
        defaultValue: false,
        access: FieldEnforcementPoint
    },
    flow: { type: Select, emptyOption: false, dataType: 'string', defaultValue: 'public', options: [
        { value: 'public', label: 'Public'},
        { value: 'authorization-code', label: 'Oauth2 Authorization Code Flow'},
        { value: 'client-credentials', label: 'Oauth2 Client Credentials Flow'},
        { value: 'kong-api-key-acl', label: 'Kong API Key with ACL Flow'},
      ]
    },
    credentialIssuer: { type: Relationship, ref: 'CredentialIssuer.environments' },
    plugins: { type: Relationship, ref: 'GatewayPlugin', many: true },
    description: {
      type: Text,
      isMultiline: true,
      isRequired: false,
    },
    services: { type: Relationship, ref: 'GatewayService.environment', many: true },
    product: { type: Relationship, ref: 'Product.environments', many: false },
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
            // if (Object.keys(originalInput).length != 1) {
            //     addValidationError("You can not update other data when changing the active status")
            // } else {
            // validations:
            // - there is at least on service associated with it
            // - if prod, that it has a BCDC record
            if (originalInput['active'] == true && existingItem['name'] == "dev") {
                addValidationError("Failed validation.  Not able to activate because of a good reason!")
            }
        }
    }
  }
}
