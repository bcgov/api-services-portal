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
    namespace: {
        type: Text,
        isRequired: true,
        defaultValue: ({ context, originalInput }) => {
            console.log("DEFAULT VALUE = "+context['authedItem']['namespace']);
            return context['authedItem'] == null ? null : context['authedItem']['namespace']
        },
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
}
