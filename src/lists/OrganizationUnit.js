const { Text, Checkbox } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')
const { Content } = require('@keystonejs/fields-content');
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
        isRequired: true,
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
  },
  access: EnforcementPoint,
}