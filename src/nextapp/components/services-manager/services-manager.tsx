import * as React from 'react';
import {
  Box,
  Divider,
  Heading,
  Icon,
  Input,
  InputLeftElement,
  InputGroup,
} from '@chakra-ui/react';
import { FaSearch, FaWrench } from 'react-icons/fa';

import ActiveServices from './active-services';
import AvailableServices from './available-services';

const ServicesManager: React.FC = () => {
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
        <ActiveServices />
        <Divider orientation="vertical" height="100%" />
        <AvailableServices />
      </Box>
    </Box>
  );
};

export default ServicesManager;
