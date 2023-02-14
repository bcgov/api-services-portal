import * as React from 'react';
import {
  Box,
  Divider,
  Heading,
  Icon,
  IconButton,
  Input,
  InputLeftElement,
  InputGroup,
  Wrap,
  Skeleton,
  WrapItem,
  InputRightElement,
  useToast,
} from '@chakra-ui/react';
import ClientRequest from '@/components/client-request';
import { FaRegTimesCircle, FaSearch, FaWrench } from 'react-icons/fa';
import { useQueryClient } from 'react-query';
import { UPDATE_ENVIRONMENT } from '@/shared/queries/products-queries';
import { useApiMutation } from '@/shared/services/api';
import type { GatewayService } from '@/types/query.types';

import ActiveServices from './active-services';
import AvailableServices from './available-services';

type ConnectPayload = {
  id: string;
};

type MutationPayload = {
  id: string;
  data: {
    services: {
      disconnectAll: boolean;
      connect: ConnectPayload[];
    };
  };
};

interface ServicesManagerProps {
  data: GatewayService[];
  environmentId: string;
  namespace: string;
}

const ServicesManager: React.FC<ServicesManagerProps> = ({
  data = [],
  environmentId,
  namespace,
}) => {
  const dataTransferType = 'application/service';
  const [search, setSearch] = React.useState<string>('');

  const toast = useToast();

  // Mutations
  const client = useQueryClient();
  const mutation = useApiMutation<MutationPayload>(UPDATE_ENVIRONMENT);

  const onServicesChange = React.useCallback(
    async (payload: ConnectPayload[]) => {
      try {
        await mutation.mutateAsync({
          id: environmentId,
          data: {
            services: {
              disconnectAll: true,
              connect: payload,
            },
          },
        });
        client.invalidateQueries(['environment', environmentId]);
      } catch (err) {
        toast({
          title: 'Services update failed',
          description: err,
          isClosable: true,
          status: 'error',
        });
      }
    },
    [client, environmentId, mutation, toast]
  );

  const onSearchChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
    },
    [setSearch]
  );
  const onSearchReset = React.useCallback(() => {
    setSearch('');
  }, [setSearch]);

  return (
    <Box bg="white" overflow="hidden">
      <Box
        m={4}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Heading size="md">
          <Icon as={FaWrench} mr={2} color="blue.500" />
          Configure Environment Services
        </Heading>
        <Box>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Filter Services"
              type="search"
              variant="bc-input"
              value={search}
              onChange={onSearchChange}
            />
            <InputRightElement>
              <IconButton
                aria-label="Clear search button"
                h="1.75rem"
                size="sm"
                variant="unstyled"
                color="gray.600"
                onClick={onSearchReset}
                opacity={search ? 1 : 0}
              >
                <Icon as={FaRegTimesCircle} boxSize="1rem" />
              </IconButton>
            </InputRightElement>
          </InputGroup>
        </Box>
      </Box>
      <Divider />
      <Box display="grid" gridTemplateColumns="1fr auto 1fr" minHeight="200px">
        <ActiveServices
          data={data}
          onRemoveService={onServicesChange}
          search={search}
        />
        <Divider orientation="vertical" height="100%" />

        <ClientRequest
          fallback={
            <Box flex={1} display="flex" flexDirection="column">
              <Box height="49px" p={4}>
                <Skeleton height="20px" width={140} />
              </Box>
              <Divider />
              <Wrap spacing="15px" flex={1} p={4}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d, index) => (
                  <WrapItem key={d}>
                    <Skeleton
                      height="20px"
                      width={`${index % 2 === 0 ? 200 : 75}px`}
                    />
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          }
        >
          <AvailableServices
            activeIds={data.map((d) => d.id)}
            dragDataType={dataTransferType}
            onAddService={onServicesChange}
            namespace={namespace}
            search={search}
          />
        </ClientRequest>
      </Box>
    </Box>
  );
};

export default ServicesManager;
