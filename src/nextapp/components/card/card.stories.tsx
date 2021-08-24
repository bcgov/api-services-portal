import * as React from 'react';
import { VStack } from '@chakra-ui/react';

import Card from './card';

export default {
  title: 'APS/Card',
};

export const DefaultCard = () => (
  <VStack spacing={4}>
    <Card>Sample Card</Card>
  </VStack>
);
