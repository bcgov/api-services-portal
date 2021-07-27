import * as React from 'react';
import addHours from 'date-fns/addHours';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Stat,
  StatGroup,
  StatLabel,
  StatLabelProps,
  StatNumber,
  Text,
  TextProps,
  Tooltip,
} from '@chakra-ui/react';
import { interpolateRdYlGn } from 'd3-scale-chromatic';
import { scaleLinear } from 'd3-scale';
import formatISO from 'date-fns/formatISO';
import format from 'date-fns/format';
import numeral from 'numeral';
import round from 'lodash/round';
import sum from 'lodash/sum';
import times from 'lodash/times';
import { useApi } from '@/shared/services/api';
// 1. Consumers
// 2. Requests
// 3. Update frequency

import { GET_METRICS } from '@/shared/queries/gateway-service-queries';
import { GatewayService } from '@/shared/types/query.types';

interface DailyDatum {
  day: string;
  dayFormatted: string;
  downtime: number;
  requests: number[];
  total: number;
  peak: number[];
}

interface MetricGraphProps {
  alt?: boolean;
  days: string[];
  height?: number;
  id: string;
  service: GatewayService;
}

const MetricGraph: React.FC<MetricGraphProps> = ({
  alt,
  days,
  height = 100,
  id,
  service,
}) => {
  const { data } = useApi(['metric', id], {
    query: GET_METRICS,
    variables: {
      service: id,
      days,
    },
  });
  const labelProps: StatLabelProps | TextProps = {
    textTransform: 'uppercase',
    fontSize: 'xs',
    fontWeight: 'bold',
    color: 'gray.400',
  };
  const values: number[][] = data.allMetrics.map((metric) => {
    return JSON.parse(metric.values);
  });
  const dailies: DailyDatum[] = values.map((value: number[]) => {
    const firstDateValue = new Date(value[0][0] * 1000);
    const day = formatISO(firstDateValue, {
      representation: 'date',
    });
    const total: number = value.reduce((memo: number, v) => {
      return memo + Number(v[1]);
    }, 0);
    const downtime = 24 - values.length;
    const defaultPeakDate: number = firstDateValue.getTime();
    const peak: any = value.reduce(
      (memo, v) => {
        if (memo[1] < Number(v[1])) {
          return v;
        }
        return memo;
      },
      [defaultPeakDate, 0]
    );

    const requests = [];

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
      downtime,
      total,
      peak,
      requests,
    };
  });
  const totalHours = 24 * 5;
  const downtime = sum(dailies.map((d) => d.downtime));
  const totalRequests = sum(dailies.map((d) => d.total));
  const peak: number[] | [number, string] = dailies.reduce(
    (memo, d) => {
      const prevPeak = Number(memo[1]);
      const currentPeak = Number(d.peak[1]);

      if (currentPeak > prevPeak) {
        return d.peak;
      }
      return memo;
    },
    [0, '0']
  );
  const peakRequests = round(Number(peak[1]), 2);
  const peakDay = format(new Date(peak[0] * 1000), 'LLL d');
  const usage = downtime / totalHours;
  const usagePercent = usage * 100;
  const color = interpolateRdYlGn(usage);
  const y = scaleLinear().range([0, height]).domain([0, 1]);

  if (data.allMetrics) {
    const max = dailies.reduce((memo: number, d) => {
      if (Number(d.peak[1]) > memo) {
        return Number(d.peak[1]);
      }
      return memo;
    }, 0);
    y.domain([0, max + 1000]);
  }

  if (alt) {
    return (
      <Box display="grid" gridTemplateColumns="1fr 2fr" flex={1} gridGap={4}>
        <Box>
          <CircularProgress
            capIsRound
            size="120px"
            value={usagePercent}
            color={color}
          >
            <CircularProgressLabel>
              <Text fontWeight="bold">{`${Math.floor(usagePercent)}%`}</Text>
              <Text {...labelProps}>Traffic</Text>
            </CircularProgressLabel>
          </CircularProgress>
        </Box>
        <StatGroup spacing={8} flexWrap="wrap">
          <Stat flex="1 1 50%">
            <StatLabel {...labelProps}>Peak</StatLabel>
            <StatNumber>{peakRequests}</StatNumber>
          </Stat>
          <Stat flex="1 1 50%">
            <StatLabel {...labelProps}>Total Req</StatLabel>
            <StatNumber overflow="hidden">
              {numeral(totalRequests).format('0.0a')}
            </StatNumber>
          </Stat>
          <Stat flex="1 1 50%">
            <StatLabel {...labelProps}>Peak Day</StatLabel>
            <StatNumber>{peakDay}</StatNumber>
          </Stat>
          <Stat flex="1 1 50%">
            <StatLabel {...labelProps}>Plugins</StatLabel>
            <StatNumber>{service?.plugins.length}</StatNumber>
          </Stat>
        </StatGroup>
      </Box>
    );
  }

  return (
    <Box flex={1} display="flex" flexDir="column">
      {0 > 10 && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertTitle mr={2}>Outage Warning</AlertTitle>
          <AlertDescription>
            There have been multiple outages that indicate there may be upstream
            errors
          </AlertDescription>
        </Alert>
      )}
      <Box display="grid" gridTemplateColumns="repeat(5, 1fr)" gridGap={1}>
        {dailies.map((d, index) => (
          <Box key={index} flex={1}>
            <Box
              display="grid"
              gridTemplateColumns="repeat(24, 1fr)"
              gridGap={0.5}
              position="relative"
              role="group"
            >
              <Box
                position="absolute"
                left={0}
                right={0}
                className="peak-text"
                display="none"
                _groupHover={{
                  display: 'block',
                }}
                style={{ bottom: y(d.peak[1]) }}
              >
                <Text
                  fontSize="xs"
                  position="relative"
                  textAlign="center"
                  color="gray.600"
                  px={2}
                  bgColor="whiteAlpha.50"
                >{`Peak: ${round(d.peak[1], 4)}`}</Text>
                <Divider />
              </Box>
              {d.requests.map((r, index) => (
                <Tooltip
                  key={index}
                  label={`${format(new Date(r[0] * 1000), 'HH:00')} - ${round(
                    r[1]
                  )} requests`}
                >
                  <Box
                    minW={1}
                    bgColor="gray.50"
                    display="flex"
                    alignItems="flex-end"
                    height={height}
                  >
                    <Box flex={1} height={y(r[1])} bgColor="green.500" />
                  </Box>
                </Tooltip>
              ))}
            </Box>
            <Text textAlign="center" fontSize="xs" mt={2} color="gray.500">
              {d.dayFormatted}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MetricGraph;
