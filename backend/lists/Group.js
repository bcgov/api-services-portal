const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
    },
    members: { type: Relationship, ref: "User.groups", many: true }
  },
  plugins: [
    byTracking(),
    atTracking()
  ]
}
