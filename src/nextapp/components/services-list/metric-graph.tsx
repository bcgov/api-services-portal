import * as React from 'react';
import {
  Box,
  HStack,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import { interpolateRdYlGn } from 'd3-scale-chromatic';
import { useApi } from '@/shared/services/api';

import { GET_METRICS } from '@/shared/queries/gateway-service-queries';

interface MetricGraphProps {
  active: boolean;
  alt?: boolean;
  id: string;
}

const MetricGraph: React.FC<MetricGraphProps> = ({ active, alt, id }) => {
  const { data } = useApi(['metric', id], {
    query: GET_METRICS,
    variables: {
      service: id,
    },
  });
  const labelProps = {
    textTransform: 'uppercase',
    fontSize: 'xs',
    fontWeight: 'bold',
    color: 'gray.400',
  };
  const values: number[][] = data.allGatewayMetrics.map((metric) => {
    return JSON.parse(metric.values);
  });
  values.forEach((v) => {
    console.log(new Date(v[0][0] * 1000).toString());
  });
  const uptime = values.reduce((memo, v) => {
    const next = v[1] >= 100 ? memo + 1 : memo;
    return next;
  }, 0);
  const outages = values.reduce((memo, v) => {
    const next = v[1] < 100 ? memo + 1 : memo;
    return next;
  }, 0);
  const color = interpolateRdYlGn(uptime / 100);

  if (alt) {
    return (
      <StatGroup flex={1} spacing={8}>
        <Stat>
          <StatLabel {...labelProps}>Uptime</StatLabel>
          <StatNumber color={color}>{`${uptime}%`}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel {...labelProps}>Outages</StatLabel>
          <StatNumber color={color}>{outages}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel {...labelProps}>Events</StatLabel>
          <StatNumber color={color}>{values.length}</StatNumber>
        </Stat>
      </StatGroup>
    );
  }

  return (
    <Box flex={1} display="flex">
      <HStack spacing={0.1} flex={1} align="end">
        {values.map((v, index) => (
          <Box
            key={index}
            display="block"
            flex={1}
            height={`${Math.min(100, v[1])}%`}
            bgColor={color}
          />
        ))}
      </HStack>
    </Box>
  );
};

export default MetricGraph;
