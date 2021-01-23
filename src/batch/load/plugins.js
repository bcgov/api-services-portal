const { graphql, lookup_id_from_name } = require('./graphql')
const { iterate_through_json_content, get_json_content, create_key_map } = require('../utils')

const ADD = `
    mutation Add(
        $name: String, 
        $kongPluginId: String,
        $config: String) {

        createPlugin(data: { 
            name: $name, 
            kongPluginId: $kongPluginId,
            config: $config
        }) {
            id
            name
        }
    }
`;

async function import_plugins() {
    services = await get_json_content ('kong', 'gw-services')
    routes = await get_json_content ('kong', 'gw-routes')
    consumers = await get_json_content ('kong', 'gw-consumers')
    plugins = await get_json_content ('kong', 'gw-plugins')

    serviceKeys = create_key_map (services['data'], 'id')
    routeKeys = create_key_map (routes['data'], 'id')
    consumerKeys = create_key_map (consumers['data'], 'id')

    for (plugin of plugins['data']) {
            const name = plugin.name
            const out = {
                name: plugin.name,
                kongPluginId: plugin.id,
                config: JSON.stringify(plugin.config, null, 3)
            }

            const done = (data) => {
                console.log("[" + name + "] - DONE ");
            }

            await graphql(ADD, out).then(done).catch(err => {
                console.log("[" + name + "] - ERR  " + err)
            })
    }
}

module.exports = {
    import_plugins: import_plugins
}