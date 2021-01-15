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
    content: {
      type: Markdown,
      isRequired: false,
    },
    grape: {
        type: GrapesJSEditor,
        isRequired: false,
      },
    yaml: {
        type: Wysiwyg,
        isRequired: false,
        editorConfig: {

        }
      },
    isComplete: {
      type: Checkbox,
      defaultValue: false,
    },
  },
};