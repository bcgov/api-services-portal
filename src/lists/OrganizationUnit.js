const { Text, Checkbox } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')
const { Content } = require('@keystonejs/fields-content');
const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce')

const { externallySourced } = require('../components/ExternalSource')

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
    title: {
        type: Text,
        isRequired: true,
    },
    // bcdc_id: {
    //     type: Text,
    //     isRequired: true,
    // },
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
  plugins: [
    externallySourced(),
  ]
}