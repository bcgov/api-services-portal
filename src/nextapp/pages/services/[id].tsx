import * as React from 'react';
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Heading,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import ClientRequest from '@/components/client-request';
import PageHeader from '@/components/page-header';
import { useApi } from '@/shared/services/api';
import { useRouter } from 'next/router';

import { GET_GATEWAY_SERVICE } from '@/shared/queries/gateway-service-queries';
import { FaExternalLinkSquareAlt } from 'react-icons/fa';
import EnvironmentBadge from '@/components/environment-badge';

const ServicePage: React.FC = () => {
  const router = useRouter();
  const { data } = useApi(
    ['gateway-service', router?.query.id],
    {
      query: GET_GATEWAY_SERVICE,
      variables: {
        id: router?.query.id,
      },
    },
    { enabled: Boolean(router?.query.id), suspense: false }
  );
  const breadcrumb = [{ href: '/services', text: 'Services' }];

  return (
    <Container maxW="6xl">
      <PageHeader
        actions={
          <Button
            variant="primary"
            rightIcon={<Icon as={FaExternalLinkSquareAlt} mt={-1} />}
          >
            View Full Metrics
          </Button>
        }
        breadcrumb={breadcrumb}
        title={
          <Box as="span">
            {data?.GatewayService.name}
            <EnvironmentBadge
              data={data?.GatewayService.environment}
              ml={2}
              fontSize="1rem"
            />
          </Box>
        }
      />
      <Box bgColor="white" mb={4}>
        <Box
          p={4}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Heading size="md">Metrics</Heading>
        </Box>
        <Divider />
        <Box height="200px" p={4}>
          Chart
        </Box>
      </Box>
      <Box display="grid" gridGap={4} gridTemplateColumns="repeat(12, 1fr)">
        <Box bgColor="white" gridColumn="span 8">
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">Routes</Heading>
          </Box>
          <Divider />
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Route</Th>
                <Th>Namespace</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.GatewayService.routes.map((r) => (
                <Tr key={r.id}>
                  <Td>{r.name}</Td>
                  <Td>{r.namespace}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <Box bgColor="white" gridColumn="span 4">
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">Details</Heading>
          </Box>
          <Divider />
          <Box p={4}>
            <Box
              as="dl"
              display="grid"
              flexWrap="wrap"
              gridColumnGap={4}
              gridTemplateColumns="1fr 2fr"
            >
              <Text as="dt" fontWeight="bold">
                Namespace
              </Text>
              <Text as="dd">{data?.GatewayService.namespace}</Text>
              <Text as="dt" fontWeight="bold">
                Host
              </Text>
              <Text as="dd">{data?.GatewayService.host}</Text>
              <Text as="dt" fontWeight="bold">
                Tags
              </Text>
              <Text as="dd">{data?.GatewayService.tags}</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ServicePage;
