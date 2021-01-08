const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')
const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce')
const GrapesJSEditor = require('keystonejs-grapesjs-editor')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
    },
    orgUnits: { type: Relationship, ref: "OrganizationUnit", many: true }
  }
}