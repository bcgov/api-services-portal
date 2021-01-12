const { Text, Checkbox } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
    },
    isActive: {
        type: Checkbox,
        isRequired: false,
    },
    accessRequest: { type: Relationship, ref: 'AccessRequest', many: true },
    plugins: { type: Relationship, ref: 'Plugin', many: true }
  },
  plugins: [
    byTracking(),
    atTracking()
  ]
}
