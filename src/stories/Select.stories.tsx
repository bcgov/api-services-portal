import * as React from 'react';
import { Select, VStack } from '@chakra-ui/react';

export default {
  title: 'BCGov/Select',
};

export const DefaultSelect = () => (
  <VStack spacing={4}>
    <Select placeholder="Select One" variant="bc-input">
      <option>hello</option>
    </Select>
  </VStack>
);
