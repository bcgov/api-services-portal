import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Center,
  CircularProgress,
  CircularProgressLabel,
  HStack,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatLabelProps,
  StatNumber,
  Text,
  TextProps,
  Tooltip,
} from '@chakra-ui/react';
import { interpolateRdYlGn } from 'd3-scale-chromatic';
import { scaleLinear } from 'd3-scale';
import formatISO9075 from 'date-fns/formatISO9075';
import format from 'date-fns/format';
import { useApi } from '@/shared/services/api';

import { GET_METRICS } from '@/shared/queries/gateway-service-queries';

interface DailyDatum {
  day: string;
  outages: number;
  requests: number[];
  total: number;
  hoursUp: number;
}

interface MetricGraphProps {
  alt?: boolean;
  days: string[];
  height?: number;
  id: string;
}

const MetricGraph: React.FC<MetricGraphProps> = ({
  alt,
  days,
  height = 150,
  id,
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
    const day = formatISO9075(new Date(value[0][0]), {
      representation: 'date',
    });
    const requests = value.map((value) => Number(value[1]));
    const total = requests.reduce(
      (memo: number, value: number) => memo + value,
      0
    );
    const outages = 24 - requests.length;

    return {
      day,
      hoursUp: requests.length,
      total,
      requests,
      outages,
    };
  });
  const totalOutages = dailies.reduce((memo: number, day) => {
    return memo + day.outages;
  }, 0);
  const totalHours = 24 * 5;
  const uptime = (totalHours - totalOutages) / totalHours;
  const color = interpolateRdYlGn(uptime);
  const y = scaleLinear().range([0, height]).domain([0, 1]);

  if (data.allMetrics) {
    const max: number = dailies.reduce(
      (memo: number, value: DailyDatum) => Math.max(memo, value.total),
      0
    );
    y.domain([0, max]);
  }

  if (alt) {
    return (
      <Box display="grid" gridTemplateColumns="1fr 2fr" flex={1} gridGap={4}>
        <Box>
          <CircularProgress
            capIsRound
            size="120px"
            value={Math.floor(uptime * 100)}
            color={color}
          >
            <CircularProgressLabel>
              <Text fontWeight="bold">{`${Math.floor(uptime * 100)}%`}</Text>
              <Text {...labelProps}>Uptime</Text>
            </CircularProgressLabel>
          </CircularProgress>
        </Box>
        <StatGroup spacing={8} flexWrap="wrap">
          <Stat flex="1 1 50%">
            <StatLabel {...labelProps}>Outages</StatLabel>
            <StatNumber color={color}>{totalOutages}</StatNumber>
          </Stat>
          <Stat flex="1 1 50%">
            <StatLabel {...labelProps}>Events</StatLabel>
            <StatNumber color={color}>{values.length}</StatNumber>
          </Stat>
          <Stat flex="1 1 50%">
            <StatLabel {...labelProps}>Outages</StatLabel>
            <StatNumber color={color}>{totalOutages}</StatNumber>
          </Stat>
          <Stat flex="1 1 50%">
            <StatLabel {...labelProps}>Events</StatLabel>
            <StatNumber color={color}>{values.length}</StatNumber>
          </Stat>
        </StatGroup>
      </Box>
    );
  }

  return (
    <Box flex={1} display="flex" flexDir="column">
      {totalOutages > 10 && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertTitle mr={2}>Outage Warning</AlertTitle>
          <AlertDescription>
            There have been multiple outages that indicate there may be upstream
            errors
          </AlertDescription>
        </Alert>
      )}
      <HStack spacing={2} flex={1} align="flex-end">
        {dailies.map((d, index) => (
          <Box key={index} flex={1}>
            <Tooltip
              label={
                <Text>
                  {`Requests: ${Math.floor(d.total)}`}
                  <br />
                  {`Outages: ${d.outages}`}{' '}
                </Text>
              }
            >
              <Box
                display="block"
                mx={4}
                height={`${y(d.total)}px`}
                bgColor={interpolateRdYlGn(d.hoursUp / 24)}
              />
            </Tooltip>
            <Text textAlign="center" fontSize="xs" mt={2} color="gray.500">
              {format(new Date(d.day), 'E, LLL do, yyyy')}
            </Text>
          </Box>
        ))}
      </HStack>
    </Box>
  );
};

export default MetricGraph;
