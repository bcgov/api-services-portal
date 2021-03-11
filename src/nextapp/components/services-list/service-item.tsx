import * as React from 'react';
import { Box, Divider, Heading, Link, Skeleton } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useInView } from 'react-intersection-observer';

import ClientRequest from '../client-request';
import EnvironmentBadge from '../environment-badge';
import MetricGraph from './metric-graph';
import { GatewayService } from '@/shared/types/query.types';

interface ServiceItemProps {
  data: GatewayService;
  range: string[];
}

const ServiceItem: React.FC<ServiceItemProps> = ({ data, range }) => {
  const { ref, inView } = useInView();

  return (
    <Box
      ref={ref}
      bg="white"
      borderRadius={4}
      border="2px solid"
      borderColor="gray.400"
      position="relative"
      overflow="hidden"
    >
      <Box
        as="header"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        p={4}
        pb={2}
      >
        <Box
          as="hgroup"
          display="flex"
          alignItems="center"
          overflow="hidden"
          mr={2}
          maxW="75%"
        >
          <Heading isTruncated size="sm" lineHeight="1.5">
            <NextLink passHref href={`/services/${data.id}`}>
              <Link>{data.name}</Link>
            </NextLink>
          </Heading>
        </Box>
        <EnvironmentBadge data={data.environment} />
      </Box>
      <Divider />
      <Box p={4} display="flex" minHeight="154px">
        {!inView && <Skeleton flex={1} m={4} />}
        {inView && (
          <ClientRequest fallback={<Skeleton flex={1} />}>
            <MetricGraph alt days={range} id={data.id} service={data} />
          </ClientRequest>
        )}
      </Box>
    </Box>
  );
};

export default ServiceItem;
