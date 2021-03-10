import { useQuery } from 'react-query';
import {
  Badge,
  Tooltip,
  Stack,
  HStack,
  Tag,
  TagLabel,
  SimpleGrid,
  VStack,
} from '@chakra-ui/react';
import type { Environment, Query, GatewayMetric } from '@/types/query.types';
import api from '@/shared/services/api';

import { GET_METRICS } from './queries';

const toDate = function (d: number) {
  const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
  return `${ye}-${mo}-${da}`;
};
const Metric = ({ service }) => {
  // last 5 days
  const days = [0, 1, 2].map((d) =>
    toDate(new Date().getTime() - 24 * 60 * 60 * 1000 * d)
  );

  const { data } = useQuery<Query>(
    'gatewaymetrics-' + service,
    async () => await api(GET_METRICS, { service: service, days: days }),
    {
      suspense: true,
    }
  );
  const noData = [];
  for (var i = 0; i < days.length * 24; i++) {
    noData.push([-1, -1]);
  }

  const ranges = [
    { max: -1, color: 'grey' },
    { max: 0, color: 'lightblue' },
    { max: 100, color: 'orange' },
    { max: 500, color: 'lightgreen' },
    { max: 999999999999, color: 'green' },
  ];
  const options = {
    dateStyle: 'full',
    timeStyle: 'full',
    hour12: true,
  };
  const dt = new Intl.DateTimeFormat('en', options);

  const color = (v) => ranges.filter((r) => v <= r.max)[0].color;

  const metrics =
    data.allGatewayMetrics.length == 0
      ? [{ id: '00', values: JSON.stringify(noData) } as GatewayMetric]
      : data.allGatewayMetrics;

  return (
    <Stack
      direction="row"
      spacing={0}
      align="flex-start"
      justify="flex-start"
      style={{ backgroundColor: 'white', padding: '5px' }}
    >
      {metrics.map((mm) =>
        JSON.parse(mm.values).map((v) => (
          <Tooltip
            label={`${dt.format(new Date(Number(v[0]) * 1000))} : ${Math.round(
              Number(v[1])
            )}`}
            aria-label=""
          >
            <p>
              <span
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '30px',
                  backgroundColor: color(v[1]),
                  marginLeft: '1px',
                }}
              ></span>
            </p>
          </Tooltip>
        ))
      )}
    </Stack>
  );
};

export default Metric;
