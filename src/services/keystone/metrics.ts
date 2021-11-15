import { gql } from 'graphql-request';
import { Logger } from '../../logger';
import { Metric } from './types';

import addHours from 'date-fns/addHours';
import format from 'date-fns/format';
import times from 'lodash/times';
import sum from 'lodash/sum';
import formatISO from 'date-fns/formatISO';

interface DailyDatum {
  day: string;
  dayFormatted: string;
  dayFormattedShort: string;
  downtime: number;
  requests: number[][];
  total: number;
  peak: number | number[];
}

const logger = Logger('keystone.metrics');

const getServiceMetricsQuery = gql`
  query GetServiceMetrics($service: String!, $days: [String!]) {
    allMetrics(
      sortBy: day_ASC
      where: {
        query: "kong_http_requests_hourly_service"
        day_in: $days
        service: { name_contains: $service }
      }
    ) {
      query
      day
      metric
      values
      service {
        name
      }
    }
  }
`;

const getConsumerMetricsQuery = gql`
  query GetConsumerMetrics($ns: String!, $consumer: String!, $days: [String!]) {
    allMetrics(
      sortBy: day_ASC
      where: {
        query: "konglog_service_consumer_hourly"
        day_in: $days
        metric_contains: $consumer
        service: { namespace: $ns }
      }
    ) {
      query
      day
      metric
      values
      service {
        name
      }
    }
  }
`;

export async function getServiceMetrics(
  context: any,
  service: string,
  days: string[]
): Promise<Metric[]> {
  const result = await context.executeGraphQL({
    query: getServiceMetricsQuery,
    variables: { service, days },
  });
  logger.debug(
    '[getServiceMetrics] (%s) result row count %d',
    service,
    result.data.allMetrics.length
  );
  return result.data.allMetrics;
}

export async function getConsumerMetrics(
  context: any,
  ns: string,
  consumer: string,
  days: string[]
): Promise<Metric[]> {
  const result = await context.executeGraphQL({
    query: getConsumerMetricsQuery,
    variables: { ns, consumer, days },
  });
  if (result.errors) {
    logger.error('[getConsumerMetrics] %j', result);
  }
  logger.debug(
    '[getConsumerMetrics] (%s,%s) result row count %d',
    ns,
    consumer,
    result.data?.allMetrics?.length
  );
  return result.data.allMetrics;
}

export function calculateStats(metrics: Metric[]) {
  const values: number[][][] = metrics.map((metric) => {
    return JSON.parse(metric.values);
  });
  const dailies: DailyDatum[] = values.map((value: number[][]) => {
    const firstDateValue = new Date(value[0][0] * 1000);
    const day = formatISO(firstDateValue, {
      representation: 'date',
    });
    const total: number = value.reduce((memo: number, v) => {
      return memo + Number(v[1]);
    }, 0);
    const downtime = 24 - values.length;
    const defaultPeakDate: number = firstDateValue.getTime();
    const peak: number[] | [number, number] = value.reduce(
      (memo, v) => {
        if (memo[1] < Number(v[1])) {
          return v;
        }
        return memo;
      },
      [defaultPeakDate, 0]
    );

    const requests = [] as number[][];

    times(24, (h) => {
      const timestampKey = addHours(new Date(firstDateValue), h).getTime();
      const request = value.find((v) => v[0] === timestampKey / 1000);

      if (request) {
        requests.push(request);
      } else {
        requests.push([timestampKey, 0]);
      }
    });

    return {
      day,
      dayFormatted: format(firstDateValue, 'E, LLL do, yyyy'),
      dayFormattedShort: format(new Date(firstDateValue), 'LLL d'),
      downtime,
      total,
      peak,
      requests,
    };
  });
  const totalRequests = Math.round(sum(dailies.map((d) => d.total)));

  return {
    totalRequests,
  };
}
