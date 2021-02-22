const querystring = require('querystring')
const moment = require('moment')
const { transfers } = require('../utils/transfers')

const queries = [
    { query: 'sum(increase(konglog_service_agent_counter[60m])) by (service, status)', id: 'service-status'}
]
async function sync({workingPath, url}) {
    console.log("Prometheus SYNC "+url)
    const exceptions = []
    xfer = transfers(workingPath, url, exceptions)

    const target = moment().format('YYYY-MM-DD')

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

        await xfer.copy (path, 'query-' + _query.id + '-' + target)
    }
}

// Run pre-defined queries
module.exports = {
    sync: sync
}
