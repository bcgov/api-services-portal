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
  GridItem,
  Stat,
  StatGroup,
  StatLabel,
  StatLabelProps,
  StatNumber,
  Text,
  TextProps,
  Tooltip,
} from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import { interpolateRdYlGn } from 'd3-scale-chromatic';
import { scaleLinear } from 'd3-scale';
import formatISO from 'date-fns/formatISO';
import differnceInDays from 'date-fns/differenceInDays';
import round from 'lodash/round';
import sum from 'lodash/sum';
import times from 'lodash/times';
import useMetrics from './use-metrics';
import { GatewayService, Metric } from '@/shared/types/query.types';
// 1. Consumers
// 2. Requests
// 3. Update frequency

// Formatters
const graphDate = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'medium',
});
const graphHour = new Intl.DateTimeFormat('en-CA', {
  timeStyle: 'short',
  hourCycle: 'h24',
});
const graphRequests = new Intl.NumberFormat('en-CA', {
  style: 'decimal',
  notation: 'compact',
});

interface DailyDatum {
  date: Date;
  day: string;
  dayFormatted: string;
  // dayFormattedShort: string;
  downtime: number;
  requests: number[];
  total: number;
  peak: number | number[];
}

interface MetricGraphProps {
  alt?: boolean;
  days: string[];
  height?: number;
  service: GatewayService;
  totalRequests: number;
}

const MetricGraph: React.FC<MetricGraphProps> = ({
  alt,
  days,
  height = 100,
  service,
  totalRequests,
}) => {
  const { data } = useMetrics(service.name, days);
  const labelProps: StatLabelProps | TextProps = {
    fontSize: 'xs',
    color: 'gray.400',
    textTransform: 'none',
  };
  const values: number[][] =
    data?.allGatewayServiceMetricsByNamespace
      .slice(0, 5)
      .map((metric: Metric) => {
        return JSON.parse(metric.values);
      }) ?? [];
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
    const peak: number | [number, number] = value.reduce(
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
      date: firstDateValue,
      dayFormatted: graphDate.format(firstDateValue),
      // TODO: possibly remove, just keep around incase
      // dayFormattedShort: format(new Date(firstDateValue), 'LLL d'),
      downtime,
      total,
      peak,
      requests,
    };
  });
  const totalDailyRequests = sum(dailies.map((d) => d.total));
  const peak = dailies.reduce(
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
  const peakDay = dailies.reduce((memo, d) => {
    if (!memo || d.total > memo.total) {
      return d;
    }
    return memo;
  }, null);
  const peakDayText = peakDay
    ? differnceInDays(new Date(), new Date(peakDay.date))
    : 'n/a';
  const usage = totalRequests > 0 ? totalDailyRequests / totalRequests : 0;
  const usagePercent = usage ? usage * 100 : 0;
  const color = usage ? interpolateRdYlGn(usage) : '#eee';
  const y = scaleLinear().range([0, height]).domain([0, 1]);

  if (data) {
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
        <StatGroup
          spacing={6}
          flexWrap="wrap"
          sx={{ '& > *': { overflow: 'hidden' } }}
        >
          <Stat flex="1 1 50%">
            <StatLabel {...labelProps}>Avg</StatLabel>
            <StatNumber fontSize="21px">
              {graphRequests.format(peakRequests)}
            </StatNumber>
          </Stat>
          <Stat flex="1 1 50%">
            <StatLabel {...labelProps}>Total Rq</StatLabel>
            <StatNumber fontSize="21px">
              {graphRequests.format(totalDailyRequests)}
            </StatNumber>
          </Stat>
          <Stat flex="1 1 50%">
            <StatLabel {...labelProps}>Days since</StatLabel>
            <StatNumber fontSize="21px">{peakDayText}</StatNumber>
          </Stat>
          <Stat flex="1 1 50%">
            <StatLabel {...labelProps}>Plugins</StatLabel>
            <StatNumber fontSize="21px" overflow="hidden">
              {service.plugins.length}
            </StatNumber>
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
        {dailies.length === 0 && (
          <GridItem colSpan={5} color="bc-text">
            <EmptyPane
              title={`${service.name} has not received traffic yet`}
              message="When this service has accumulated traffic, it will show up here"
            />
          </GridItem>
        )}
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
                  label={`${graphHour.format(new Date(r[0] * 1000))} - ${round(
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
