const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

const { EnforcementPoint } = require('../authz/enforcement')

// Aidan (actor) approved (action) AccessRequest[erxAPIs for Bill #222-333-333] (type,name,refId) "Approved access request" (message)
module.exports = {
  fields: {
    extRefId: {
        type: Text,
        isRequired: false,
    },
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
    namespace: {
        type: Text,
        isRequired: false,
    },
    actor: { type: Relationship, ref: 'User' }
  },
  access: EnforcementPoint,
  plugins: [
    atTracking()
  ],
  recordActivity: (context, action, type, refId, message) => {
        console.log("Record Activity")
        const userId = context.authedItem.userId
        const namespace = context.authedItem.namespace
        const name = `${action} ${type}[${refId}]`
        console.log("USERID="+userId+" NAME=" + name)

        return context.executeGraphQL({
            query: `mutation ($name: String, $namespace: String, $type: String, $action: String, $refId: String, $message: String, $userId: String) {
                    createActivity(data: { type: $type, name: $name, namespace: $namespace, action: $action, refId: $refId, message: $message, actor: { connect: { id : $userId }} }) {
                        id
                } }`,
            variables: { name, namespace, type, action, refId, message, userId },
        }).catch (err => {
            console.log("Activity : recording activity failed " + err)
        })
  }
}
