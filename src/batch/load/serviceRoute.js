const { graphql, lookup_id_from_name } = require('./graphql')
const { iterate_through_json_content, get_json_content, create_key_map } = require('../utils')

const ADD = `
    mutation Add(
        $name: String, 
        $kongRouteId: String, 
        $kongServiceId: String, 
        $namespace: String, 
        $host: String, 
        $isActive: Boolean, 
        $tags: String) {

        createServiceRoute(data: { 
            name: $name, 
            kongRouteId: $kongRouteId,
            kongServiceId: $kongServiceId,
            namespace: $namespace, 
            host: $host, 
            isActive: $isActive, 
            tags: $tags
        }) {
            id
            name
        }
    }
`;

function lookup_namespace (service) {
    const tag = service.tags.filter(t => t.startsWith('ns.') && t.indexOf('.', 3) == -1)[0]
    return tag ? tag.substr(3):""
}

function build_hosts (route) {
    const scheme = 'https'
    const paths = route['paths'] != null && route.paths.length > 1 ? "[" + route.paths.join('|') + "]" : (route.paths == null || route.paths.length == 0 ? "/" : route.paths[0])
    return route.hosts.map(host => {
        return scheme + "://" + host + paths
    })
}

async function import_service_routes() {
    services = await get_json_content ('kong', 'gw-services')
    routes = await get_json_content ('kong', 'gw-routes')

    serviceKeys = create_key_map (services['data'], 'id')

    for (route of routes['data']) {
        const service = serviceKeys[route.service.id]
        const ns = lookup_namespace(service)
        const hosts = build_hosts (route)
        if (!ns) {
            console.log("Namespace is missing! " + JSON.stringify(service, null, 4))
        }
        for (host of hosts) {
            const out = {
                name: route.name,
                namespace: ns,
                kongServiceId: service.id,
                kongRouteId: route.id,
                host: host,
                isActive: true,
                tags: JSON.stringify(service.tags),
            }

            const _id = await lookup_id_from_name ('ServiceRoutes', out.name)
            if (_id != null) {
                console.log("SKIPPING ALREADY EXISTS " + out.name);
            } else {
                const done = (data) => {
                    console.log("[" + route.name + "] - DONE ");
                }
                await graphql(ADD, out).then(done).catch(err => {
                    console.log("[" + route.name + "] - ERR  " + err)
                })
            }
        }
    }
}

module.exports = {
    import_service_routes: import_service_routes
}