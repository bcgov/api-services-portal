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
    authMethod: { type: Select, emptyOption: false, default: 'public', options: [
        { value: 'public', label: 'Public'},
        { value: 'oidc', label: 'OIDC'},
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
}
