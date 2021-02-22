const { graphql, lookup_id_from_attr } = require('./graphql')
const { iterate_through_json_content, get_json_content, create_key_map, lookup_namespace } = require('../utils')

const ADD = `
    mutation Add(
        $username: String, 
        $customId: String, 
        $kongConsumerId: String, 
        $namespace: String, 
        $tags: String) {

        createConsumer(data: { 
            username: $username, 
            customId: $customId, 
            kongConsumerId: $kongConsumerId,
            namespace: $namespace, 
            tags: $tags
        }) {
            id
            username
        }
    }
`;


async function import_consumers() {
    consumers = await get_json_content ('kong', 'gw-consumers')

    for (consumer of consumers['data']) {
        const out = {
            username: consumer.username,
            customId: consumer.custom_id,
            namespace: lookup_namespace(consumer),
            kongConsumerId: consumer.id,
            tags: consumer.tags == null ? "[]" : JSON.stringify(consumer.tags),
        }

        const _id = await lookup_id_from_attr ('Consumers', 'username', out.username)
        if (_id != null) {
            console.log("SKIPPING ALREADY EXISTS " + out.username);
        } else {
            const done = (data) => {
                console.log("[" + out.username + "] - DONE ");
            }
            await graphql(ADD, out).then(done).catch(err => {
                console.log("[" + out.username + "] - ERR  " + err)
            })
        }
    }
}

module.exports = {
    import_consumers: import_consumers
}