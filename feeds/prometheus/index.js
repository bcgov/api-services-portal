const querystring = require('querystring')
const moment = require('moment')
const { transfers } = require('../utils/transfers')
const { portal } = require('../utils/portal')

const queries = [
    { query: 'sum(increase(kong_http_status[60m])) by (service)', step: 60*60, id: 'kong_http_requests_hourly_service'},
    { query: 'sum(increase(kong_http_status[60m])) by (namespace)', step: 60*60, id: 'kong_http_requests_hourly_namespace'},
    { query: 'sum(increase(kong_http_status[60m])) by (namespace)', step: 60*60*24, id: 'kong_http_requests_daily_namespace'},
    { query: 'sum(increase(kong_http_status[60m]))', step: 60*60*24, id: 'kong_http_requests_daily'},
]

async function sync({workingPath, url, destinationUrl}) {
    console.log("Prometheus SYNC "+url)
    const exceptions = []
    xfer = transfers(workingPath, url, exceptions)

    // run all queries for last 14 days
    for (var d = 0; d < 14; d++) {
        const target = moment().add(-d, 'days').format('YYYY-MM-DD')

        for ( _query of queries) {

            const query = _query.query

            var day = moment(target)

            const params = {
                query: query, 
                start: day.unix(),
                end: day.add(24, 'hour').add(-1, 'second').unix(), 
                step: _query.step,
                _: moment().valueOf()
            }
            console.log(day.fromNow())
            const path = "/api/v1/query_range?" + querystring.stringify(params)

            await xfer.copy (path, 'query-' + _query.id + '-' + target)
        }
    }
    
    // Now, send to portal
    await xfer.concurrentWork(producer(xfer, destinationUrl))
}

function producer (xfer, destinationUrl) {
    const destination = portal(destinationUrl)

    const work = []
    for (var d = 0; d < 14; d++) {
        const target = moment().add(-d, 'days').format('YYYY-MM-DD')
        for ( _query of queries) {
            xfer.get_json_content('query-' + _query.id + '-' + target)['data'][0]['result'].map(metric => {
                work.push ({target: target, query: _query, metric: metric})
            })
        }
    }
    let index = 0
    return () => {
        if (index == work.length) {
            console.log("Finished producing "+ index + " records.")
            return null
        }
        const item = work[index]
        index++

        const name = JSON.stringify(item.metric['metric'])
        item.metric['id'] = item.query.id + '.' + item.target + '.' + JSON.stringify(item.metric['metric'])
        item.metric['day'] = item.target
        item.metric['query'] = item.query.id

        return destination.fireAndForget('/feed/GatewayMetric', item.metric)
        .then ((result) => console.log(`[${name}] OK`, result))
        .catch (err => console.log(`[${name}] ERR ${err}`))

    }
}

// Run pre-defined queries
module.exports = {
    sync: sync
}
