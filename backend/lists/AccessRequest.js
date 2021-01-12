const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
    },
    content: {
        type: Markdown,
        isRequired: false,
    },
    isApproved: {
      type: Checkbox,
      isRequired: false,
      default: false
    },
    isIssued: {
        type: Checkbox,
        isRequired: false,
        default: false
    },
    isComplete: {
        type: Checkbox,
        isRequired: false,
        default: false
    },
    credential: {
        type: Text,
        isRequired: false,
    },
    consumer: { type: Relationship, ref: 'Consumer' },
    datasetGroup: { type: Relationship, ref: 'DatasetGroup' },
    activity: { type: Relationship, ref: 'Activity', many: true },
  },
  plugins: [
    byTracking(),
    atTracking()
  ]
}
