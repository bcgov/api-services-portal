const { Text, Checkbox } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')
const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce')
const GrapesJSEditor = require('keystonejs-grapesjs-editor')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
    },
    description: {
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
};
