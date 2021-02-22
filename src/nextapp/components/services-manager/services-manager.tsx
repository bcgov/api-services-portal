import * as React from 'react';
import {
  Box,
  Divider,
  Heading,
  Icon,
  Input,
  InputLeftElement,
  InputGroup,
  Text,
} from '@chakra-ui/react';
import ClientRequest from '@/components/client-request';
import { FaSearch, FaWrench } from 'react-icons/fa';
import type { ServiceRoute } from '@/types/query.types';

import ActiveServices from './active-services';
import AvailableServices from './available-services';

interface ServicesManagerProps {
  data: ServiceRoute[];
}

const ServicesManager: React.FC<ServicesManagerProps> = ({ data }) => {
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
            />
          </InputGroup>
        </Box>
      </Box>
      <Divider />
      <Box display="grid" gridTemplateColumns="1fr auto 1fr">
        <ActiveServices data={data} />
        <Divider orientation="vertical" height="100%" />
        <ClientRequest fallback={<Text>Loading...</Text>}>
          <AvailableServices />
        </ClientRequest>
      </Box>
    </Box>
  );
};

export default ServicesManager;
