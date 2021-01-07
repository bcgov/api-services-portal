const { Text, Checkbox } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
    },
    isApproved: {
      type: Checkbox,
      isRequired: false,
    },
    isActive: {
        type: Checkbox,
        isRequired: false,
    }
  },
  plugins: [
    byTracking(),
    atTracking()
  ]
}
