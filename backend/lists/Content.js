const { Text, Checkbox } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

module.exports = {
  fields: {
    description: {
      type: Text,
      isRequired: true,
    },
    content: {
      type: Markdown,
      isRequired: false,
    },
    isComplete: {
      type: Checkbox,
      defaultValue: false,
    },
  },
};