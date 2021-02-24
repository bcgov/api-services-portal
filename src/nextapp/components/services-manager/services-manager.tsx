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
} from '@chakra-ui/react';
import ClientRequest from '@/components/client-request';
import { FaRegTimesCircle, FaSearch, FaWrench } from 'react-icons/fa';
import type { GatewayService } from '@/types/query.types';

import ActiveServices from './active-services';
import AvailableServices from './available-services';

interface ServicesManagerProps {
  data: GatewayService[];
  namespace: string;
}

const ServicesManager: React.FC<ServicesManagerProps> = ({
  data,
  namespace,
}) => {
  const [search, setSearch] = React.useState<string>('');
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
        <ActiveServices data={data} search={search} />
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
          <AvailableServices namespace={namespace} search={search} />
        </ClientRequest>
      </Box>
    </Box>
  );
};

export default ServicesManager;
