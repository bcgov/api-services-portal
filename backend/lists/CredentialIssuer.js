const { Text, Checkbox, Select, Relationship, Url, Password } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
    },
    description: {
        type: Markdown,
        isRequired: true,
    },
    oidcDiscoveryUrl: {
        type: Url,
        isRequired: true,
        views: '../admin/fieldViews/link'
    },
    clientId: {
        type: Text,
        isRequired: false,
    },
    clientSecret: {
        type: Password,
        isRequired: false,
    },
    dataSetGroups: { type: Relationship, ref: 'DatasetGroup', many: true }
  },
  plugins: [
    byTracking(),
    atTracking()
  ]
}