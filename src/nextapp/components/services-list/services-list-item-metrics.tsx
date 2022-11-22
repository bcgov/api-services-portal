import * as React from 'react';
import {
  CircularProgress,
  CircularProgressLabel,
  Td,
  Text,
} from '@chakra-ui/react';
import useMetrics from './use-metrics';
import { Environment } from '@/shared/types/query.types';

interface ServicesListItemMetricsProps {
  days: string[];
  environment: Environment;
  service: string;
  totalRequests: number;
}

const ServicesListItemMetrics: React.FC<ServicesListItemMetricsProps> = ({
  days,
  environment,
  service,
  totalRequests,
}) => {
  const ref = React.useRef(null);
  const environmentName = environment?.name ?? 'no-env';
  const [enabled, setEnabled] = React.useState(false);
  const { data } = useMetrics(service, days, {
    enabled,
  });
  const totalServiceRequests = React.useMemo(() => {
    if (data?.allGatewayServiceMetricsByNamespace) {
      const allValues = data.allGatewayServiceMetricsByNamespace.map((m) =>
        JSON.parse(m.values)
      );
      const values = allValues.reduce((memo: number[], hour) => {
        hour.forEach((v: [string, number][]) => {
          const [_, hourTotal] = v;
          memo.push(Number(hourTotal));
        });
        return memo;
      }, []);
      return values.reduce((memo: number, value: number) => {
        return memo + value;
      }, 0);
    }
    return 0;
  }, [data]);
  const value =
    totalServiceRequests && totalRequests
      ? (totalServiceRequests / totalRequests) * 100
      : 0;
  const handleIntersection = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setEnabled(true);
      }
    },
    []
  );

  React.useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection);
    const target = ref.current;

    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [handleIntersection]);

  return (
    <>
      <Td
        ref={ref}
        data-testid={`${service}-${environmentName}-totalRequest-graph`}
      >
        <CircularProgress
          capIsRound
          size="56px"
          value={value}
          color="bc-success"
          thickness="10px"
        >
          <CircularProgressLabel>
            <Text fontWeight="bold">{`${Math.floor(value)}%`}</Text>
          </CircularProgressLabel>
        </CircularProgress>
      </Td>
      <Td data-testid={`${service}-${environmentName}-totalRequest`}>
        {Math.floor(totalServiceRequests)}
      </Td>
    </>
  );
};

export default ServicesListItemMetrics;
