const querystring = require('querystring')
const moment = require('moment')
const { transfers } = require('../utils/transfers')
const { portal } = require('../utils/portal')

const queries = [
    { query: 'sum(increase(konglog_service_agent_counter[60m])) by (service, status)', id: 'konglog_service_status'}
]
async function sync({workingPath, url, destinationUrl}) {
    console.log("Prometheus SYNC "+url)
    const exceptions = []
    xfer = transfers(workingPath, url, exceptions)

    // last 14 days
    for (var d = 0; d < 14; d++) {
        const target = moment().add(-d, 'days').format('YYYY-MM-DD')

        for ( _query of queries) {

            const query = _query.query

            var day = moment(target)

            const params = {
                query: query, 
                start: day.unix(),
                end: day.add(24, 'hour').add(-1, 'second').unix(), 
                step: 60 * 60,
                _: moment().valueOf()
            }
            console.log(day.fromNow())
            const path = "/api/v1/query_range?" + querystring.stringify(params)

            //await xfer.copy (path, 'query-' + _query.id + '-' + target)
        }
    }
    
    // Now, send to portal
    destination = portal(destinationUrl)

    for (var d = 0; d < 14; d++) {
        const target = moment().add(-d, 'days').format('YYYY-MM-DD')
        for ( _query of queries) {
            xfer.get_json_content('query-' + _query.id + '-' + target)['data'][0]['result'].map(metric => {
                const name = JSON.stringify(metric['metric'])
                metric['id'] = _query.id + '.' + target + '.' + JSON.stringify(metric['metric'])
                metric['day'] = target
                metric['query'] = _query.id

                destination.fireAndForget('/feed/GatewayMetric', metric)
                .then ((result) => console.log(`[${name}] OK`, result))
                .catch (err => console.log(`[${name}] ERR ${err}`))
            })
        }
    }
}

// Run pre-defined queries
module.exports = {
    sync: sync
}
