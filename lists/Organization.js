const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')
const { Content } = require('@keystonejs/fields-content');
const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce')
const GrapesJSEditor = require('keystonejs-grapesjs-editor')

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
    title: {
        type: Text,
        isRequired: true,
    },
    bcdc_id: {
        type: Text,
        isRequired: true,
    },
    tags: {
        type: Text,
        isRequired: true,
    },
    description: {
        type: Text,
        isRequired: false,
    },
    orgUnits: { type: Relationship, ref: "OrganizationUnit", many: true }
  }
}