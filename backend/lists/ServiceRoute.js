const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
    },
    host: {
        type: Text,
        isRequired: true,
    },
    isActive: {
        type: Checkbox,
        isRequired: false,
    },
    plugins: { type: Relationship, ref: 'Plugin', many: true },

  },
  plugins: [
    byTracking(),
    atTracking()
  ]
}
