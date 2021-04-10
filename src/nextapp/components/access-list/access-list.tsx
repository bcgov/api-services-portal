import * as React from 'react';
import { Box } from '@chakra-ui/react';
import groupBy from 'lodash/groupBy';
import { ServiceAccess } from '@/shared/types/query.types';
import AccessListItem from './access-list-item';
import { QueryKey } from 'react-query';

interface AccessListProps {
  data: ServiceAccess[];
  queryKey: QueryKey;
}

const AccessList: React.FC<AccessListProps> = ({ data, queryKey }) => {
  const productsDict = groupBy(data, (d) => d.productEnvironment?.product.name);
  const products = Object.keys(productsDict);

  return (
    <Box>
      {products.map((p) => (
        <AccessListItem
          key={p}
          product={p}
          data={productsDict[p]}
          queryKey={queryKey}
        />
      ))}
    </Box>
  );
};

export default AccessList;
