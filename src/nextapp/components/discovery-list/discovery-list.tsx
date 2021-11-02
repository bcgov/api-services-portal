import * as React from 'react';
import { Grid } from '@chakra-ui/react';
import { Dataset, Product } from '@/shared/types/query.types';

import DiscoveryListItem from './discovery-list-item';

interface DiscoveryListProps {
  data: Dataset[];
}

const DiscoveryList: React.FC<DiscoveryListProps> = ({ data }) => {
  return (
    <Grid
      gap={4}
      templateColumns={{
        base: '1fr',
        sm: '1fr 1fr',
        md: 'repeat(3, 1fr)',
      }}
    >
      {data?.map((p) => (
        <DiscoveryListItem key={p.id} data={p} />
      ))}
    </Grid>
  );
};

export default DiscoveryList;
