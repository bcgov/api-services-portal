import * as React from 'react';
import { VStack } from '@chakra-ui/react';
import { Product } from '@/shared/types/query.types';

import DiscoveryListItem from './discovery-list-item';

interface DiscoveryListProps {
  data: Product[];
}

const DiscoveryList: React.FC<DiscoveryListProps> = ({ data }) => {
  return (
    <VStack spacing={4}>
      {data.map((p) => (
        <DiscoveryListItem key={p.id} data={p} />
      ))}
    </VStack>
  );
};

export default DiscoveryList;
