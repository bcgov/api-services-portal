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
    description: {
        type: Markdown,
        isRequired: true,
    },
    authMethod: { type: Select, emptyOption: false, default: 'public', options: [
        { value: 'public', label: 'Public'},
        { value: 'oidc', label: 'OIDC'},
        { value: 'keys', label: 'API Keys'},
      ]
    },
    useAcl: {
        type: Checkbox,
        isRequired: true,
        default: false
    },
    oidcIssuer: {
        type: Text,
        isRequired: false,
        default: false
    },
    description: {
      type: Text,
      isMultiline: true,
      isRequired: false,
    },
    credentialIssuer: { type: Relationship, ref: 'CredentialIssuer.datasetGroups' },
    organization: { type: Relationship, ref: 'Organization' },
    organizationUnit: { type: Relationship, ref: 'OrganizationUnit' },
    services: { type: Relationship, ref: 'ServiceRoute', many: true },
  },
  access: EnforcementPoint,
}
