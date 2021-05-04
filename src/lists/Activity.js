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
    result: {
        type: Text,
        isRequired: false,
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
    actor: { type: Relationship, ref: 'User' },
    blob: { type: Relationship, ref: 'Blob' }
  },
  access: EnforcementPoint,
  plugins: [
    atTracking()
  ],
  hooks: {
    afterChange: (async function ({
        operation,
        existingItem,
        originalInput,
        updatedItem,
        context,
        listKey,
        fieldPath, // exists only for field hooks
      }) {
        console.log("ACTIVITY " + operation + " " + JSON.stringify(originalInput, null, 3));
        console.log("ACTIVITY " + operation + " " + JSON.stringify(updatedItem, null, 3));

        if (updatedItem.action == 'publish' && updatedItem.type == 'GatewayConfig') {
            const feeder = require('../services/feeder');
            const feederApi = new feeder(process.env.FEEDER_URL)
            feederApi.forceSync('kong', 'namespace', updatedItem.namespace).catch (err => {
                console.log("Capture and log error " + err)
            })
        }
    })
  },
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
        })
  }
}
