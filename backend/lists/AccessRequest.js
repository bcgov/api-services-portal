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
    },
    isActive: {
        type: Checkbox,
        isRequired: false,
    },
    requestor: { type: Relationship, ref: 'TemporaryIdentity' },
    datasetGroup: { type: Relationship, ref: 'DatasetGroup' },
  },
  plugins: [
    byTracking(),
    atTracking()
  ]
}
