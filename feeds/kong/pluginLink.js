const { graphql, lookup_id_from_attr } = require('./graphql')
const { get_json_content, create_key_map } = require('../utils')

const ADD_PLUGINS_TO_SERVICEROUTE = `
    mutation update($id: ID!, $data: ServiceRouteUpdateInput) {
        updateServiceRoute(id: $id, data: $data) {
            name
        }
    }
`

const ADD_PLUGINS_TO_CONSUMER = `
    mutation update($id: ID!, $data: ConsumerUpdateInput) {
        updateConsumer(id: $id, data: $data) {
            name
        }
    }
`

function get_ref_id_from_plugin (plugin) {
    if (plugin.consumer == null) {
        return (plugin.service == null ? (plugin.route == null ? null : plugin.route.id) : plugin.service.id)
    } else {
        return plugin.consumer.id
    }
}

async function update_links() {
    services = await get_json_content ('kong', 'gw-services')
    routes = await get_json_content ('kong', 'gw-routes')
    consumers = await get_json_content ('kong', 'gw-consumers')
    plugins = await get_json_content ('kong', 'gw-plugins')

    serviceKeys = create_key_map (services['data'], 'id')
    routeKeys = create_key_map (routes['data'], 'id')
    consumerKeys = create_key_map (consumers['data'], 'id')

    allPluginMap = {}

    // Loop through the plugins and create a map of consumer||service||route and a list of plugins
    for (plugin of plugins['data']) {
        const refId = get_ref_id_from_plugin (plugin)
        const ksPluginId = await lookup_id_from_attr ('Plugins', 'kongPluginId', plugin.id)
        if (ksPluginId == null) {
            throw Error("Plugin should exist! " + plugin.name)
        }
        if (refId in allPluginMap) {
            allPluginMap[refId].push(ksPluginId)
        } else {
            allPluginMap[refId] = [ ksPluginId ]
        }
    }
    console.log("Evaluated " + Object.keys(allPluginMap).length + " objects")

    for (route of routes['data']) {
        console.log(route.name)
        const pluginIds = allPluginMap[route.id]
        if (pluginIds != null) {
            console.log("NONE" + JSON.stringify(pluginIds))
            const kcRouteId = await lookup_id_from_attr ('ServiceRoutes', 'kongRouteId', route.id)

            const ee = await graphql(ADD_PLUGINS_TO_SERVICEROUTE, {id: kcRouteId, data: { plugins: { disconnectAll: true, connect: pluginIds.map(id => { return { id: id} }) }}})
            console.log("AAA = "+JSON.stringify(ee, null, 3))

        }
    }

    for (consumer of consumers['data']) {
        console.log(consumer.username)
        const pluginIds = allPluginMap[consumer.id]
        if (pluginIds != null) {
            console.log("NONE" + JSON.stringify(pluginIds))
            const kcConsumerId = await lookup_id_from_attr ('Consumers', 'kongConsumerId', consumer.id)

            const ee = await graphql(ADD_PLUGINS_TO_CONSUMER, {id: kcConsumerId, data: { plugins: { disconnectAll: true, connect: pluginIds.map(id => { return { id: id} }) }}})
            console.log("AAA = "+JSON.stringify(ee, null, 3))

        }
    }

}

module.exports = {
    update_plugin_links: update_links
}