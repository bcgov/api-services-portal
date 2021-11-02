const querystring = require('querystring');
const moment = require('moment');
const { transfers } = require('../utils/transfers');
const { portal } = require('../utils/portal');

const queries = [
  {
    query: 'sum(increase(kong_http_status[1d])) by (service,code)',
    step: 60 * 60 * 24,
    id: 'kong_http_requests_daily_service_code',
  },
  {
    query: 'sum(increase(kong_http_status[60m])) by (service)',
    step: 60 * 60,
    id: 'kong_http_requests_hourly_service',
  },
  {
    query: 'sum(increase(kong_http_status[60m])) by (namespace)',
    step: 60 * 60,
    id: 'kong_http_requests_hourly_namespace',
  },
  {
    query: 'sum(increase(kong_http_status[1d])) by (namespace)',
    step: 60 * 60 * 24,
    id: 'kong_http_requests_daily_namespace',
  },
  {
    query: 'sum(increase(kong_http_status[1d]))',
    step: 60 * 60 * 24,
    id: 'kong_http_requests_daily',
  },
  {
    query:
      'sum(increase(konglog_service_consumer_counter[60m])) by (consumer,service)',
    step: 60 * 60,
    id: 'konglog_service_consumer_hourly',
  },
];

async function sync(
  { workingPath, url, destinationUrl },
  params = { numDays: 5 }
) {
  console.log('Prometheus SYNC (DAYS=' + params.numDays + ') ' + url);
  const exceptions = [];
  xfer = transfers(workingPath, url, exceptions);

  // run all queries for last 3 days
  for (var d = 0; d < params.numDays; d++) {
    const target = moment().add(-d, 'days').format('YYYY-MM-DD');

    for (_query of queries) {
      const query = _query.query;

      var day = moment(target);

      const params = {
        query: query,
        start: day.unix(),
        end: day.add(24, 'hour').add(-1, 'second').unix(),
        step: _query.step,
        _: moment().valueOf(),
      };
      console.log(day.fromNow());
      const path = '/api/v1/query_range?' + querystring.stringify(params);

      await xfer.copy(path, 'query-' + _query.id + '-' + target);
    }
  }

  // Now, send to portal
  await xfer.concurrentWork(producer(xfer, params.numDays, destinationUrl));
}

function producer(xfer, numDays, destinationUrl) {
  const destination = portal(destinationUrl);

  const work = [];
  for (var d = 0; d < numDays; d++) {
    const target = moment().add(-d, 'days').format('YYYY-MM-DD');
    for (_query of queries) {
      xfer
        .get_json_content('query-' + _query.id + '-' + target)
        ['data'][0]['result'].map((metric) => {
          work.push({ target: target, query: _query, metric: metric });
        });
    }
  }
  let index = 0;
  return () => {
    if (index == work.length) {
      console.log('Finished producing ' + index + ' records.');
      return null;
    }
    const item = work[index];
    xfer.inject_hash_and_source('prometheus', item);
    index++;

    const name = JSON.stringify(item.metric['metric']);
    item.metric['id'] =
      item.query.id +
      '.' +
      item.target +
      '.' +
      JSON.stringify(item.metric['metric']);
    item.metric['day'] = item.target;
    item.metric['query'] = item.query.id;
    // convert the time from seconds to milliseconds
    //item.metric['values'].map ( value => { value[0] = moment(value[0]).local().valueOf() } )

    return destination
      .fireAndForget('/feed/Metric', item.metric)
      .then((result) => console.log(`[${name}] OK`, result))
      .catch((err) => console.log(`[${name}] ERR ${err}`));
  };
}

/*
       "result": [
            {
                "metric": {
                    "namespace": "ns123"
                },
                "values": [
                    [
                        1615622400,
                        "150975.0627615063"
                    ]
                ]
            },
*/

// Run pre-defined queries
module.exports = {
  sync: sync,
};
