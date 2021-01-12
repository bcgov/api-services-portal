const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

// Aidan (actor) approved (action) AccessRequest[erxAPIs for Bill #222-333-333] (type,name,refId) "Approved access request" (message)
module.exports = {
  fields: {
    type: {
        type: Text,
        isRequired: true,
    },
    name: {
        type: Text,
        isRequired: true,
    },
    action: {
        type: Text,
        isRequired: true,
    },
    message: {
        type: Markdown,
        isRequired: false,
    },
    refId: {
        type: Text,
        isRequired: true,
    },
    actor: { type: Relationship, ref: 'TemporaryIdentity' }
  },
  plugins: [
    atTracking()
  ]
}
