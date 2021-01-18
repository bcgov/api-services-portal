const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
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
    sector: {
        type: Text,
        isRequired: false,
    },
    license_title: {
        type: Text,
        isRequired: false,
    },
    view_audience: {
        type: Text,
        isRequired: false,
    },
    private: {
        type: Checkbox,
        isRequired: false,
        default: false
    },
    tags: {
        type: Text,
        isRequired: false,
    },
    contacts: {
        type: Text,
        isRequired: false,
    },
    organization: { type: Relationship, ref: 'Organization' },
    organizationUnit: { type: Relationship, ref: 'OrganizationUnit' },
    securityClass: {
        type: Text,
        isRequired: false,
    },
    notes: {
      type: Text,
      isRequired: false,
    },
    title: {
        type: Text,
        isRequired: false,
    },
    catalogContent: {
      type: Markdown,
      isRequired: false,
    },
    isInCatalog: {
        type: Checkbox,
        isRequired: true,
        default: false
    }
  },
  access: EnforcementPoint,
}
