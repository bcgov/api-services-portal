import * as React from 'react';
import api from '@/shared/services/api';
import {
  Badge,
  Box,
  Heading,
  Icon,
  Link,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import { FaCircle } from 'react-icons/fa';
import NewProduct from '@/components/new-product';
import NextLink from 'next/link';
import { useQuery } from 'react-query';
import type { Query } from '@/types/query.types';

import { LIST_GATEWAY_SERVICES } from '@/shared/queries/gateway-service-queries';
import MetricGraph from './metric-graph';
import ClientRequest from '../client-request';
import EnvironmentBadge from '../environment-badge';

interface ServicesListProps {
  search: string;
}

const ServicesList: React.FC<ServicesListProps> = ({ search }) => {
  const { data } = useQuery<Query>(
    'gateway-services',
    async () => await api(LIST_GATEWAY_SERVICES),
    {
      suspense: true,
    }
  );
  const filterServices = React.useCallback(
    (d) => {
      return d.name.search(search) >= 0;
    },
    [search]
  );

  return (
    <>
      {data.allGatewayServices.length <= 0 && (
        <Box gridColumnStart="2" gridColumnEnd="4">
          <EmptyPane
            title="No services created yet."
            message="You need to create a product before services are available"
            action={<NewProduct />}
          />
        </Box>
      )}
      {data.allGatewayServices.filter(filterServices).map((d) => (
        <Box
          key={d.id}
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
                <NextLink passHref href={`/services/${d.id}`}>
                  <Link>{d.name}</Link>
                </NextLink>
              </Heading>
            </Box>
            <EnvironmentBadge data={d.environment} />
          </Box>
          <Box p={4} display="flex" minHeight="150px">
            <ClientRequest fallback={<Skeleton flex={1} />}>
              <MetricGraph id={d.id} active={d.environment?.active} />
            </ClientRequest>
          </Box>
        </Box>
      ))}
    </>
  );
};

export default ServicesList;
