
// some data from Kong must be masked as it has some sensitve information
// such as the config for redis rate limiting

const configMask = [ 'redis_password', 'redis_host' ]

const mask = function (plugin) {
    if ('config' in plugin) {
        Object.keys(plugin['config']).filter(key => configMask.includes(key))
        .map(key => {
            plugin['config'][key] = "****"
        })
    }
    return plugin
}

module.exports = mask
