import * as React from 'react';
import { Box } from '@chakra-ui/react';
import groupBy from 'lodash/groupBy';
import uniqBy from 'lodash/uniqBy';
import { ServiceAccess } from '@/shared/types/query.types';
import { QueryKey } from 'react-query';

import AccessListItem from './access-list-item';

interface AccessListProps {
  data: ServiceAccess[];
  queryKey: QueryKey;
}

const AccessList: React.FC<AccessListProps> = ({ data, queryKey }) => {
  const productsDict = groupBy(data, (d) => d.productEnvironment?.product?.id);
  const allProducts = data
    .filter((a) => Boolean(a.productEnvironment?.product))
    .map((a) => a.productEnvironment?.product);
  const products = uniqBy(allProducts, 'id');

  return (
    <Box>
      {products.map((p) => (
        <AccessListItem
          key={p.id}
          product={p}
          data={productsDict[p.id]}
          queryKey={queryKey}
        />
      ))}
    </Box>
  );
};

export default AccessList;
