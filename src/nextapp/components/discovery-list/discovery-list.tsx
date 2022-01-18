import * as React from 'react';
import { Grid } from '@chakra-ui/react';
import { Dataset, Product } from '@/shared/types/query.types';

import DiscoveryListItem from './discovery-list-item';

interface DiscoveryDataset extends Dataset {
  products: Product[];
}

interface DiscoveryListProps {
  data: DiscoveryDataset[];
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
      {data?.map((p, index) => (
        <DiscoveryListItem
          key={p.id}
          data={p}
          data-testid={`discovery-item-${index}`}
        />
      ))}
    </Grid>
  );
};

export default DiscoveryList;
