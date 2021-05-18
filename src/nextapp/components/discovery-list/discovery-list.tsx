import * as React from 'react';
import { Grid, GridItem } from '@chakra-ui/react';
import { Product } from '@/shared/types/query.types';

import DiscoveryListItem from './discovery-list-item';

interface DiscoveryListProps {
  data: Product[];
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
        <GridItem key={p.id}>
          <DiscoveryListItem data={p} />
        </GridItem>
      ))}
    </Grid>
  );
};

export default DiscoveryList;
