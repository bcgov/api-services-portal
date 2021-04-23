import * as React from 'react';
import { Box } from '@chakra-ui/react';
import groupBy from 'lodash/groupBy';
import reduce from 'lodash/reduce';
import { ServiceAccess } from '@/shared/types/query.types';
import AccessListItem from './access-list-item';
import { QueryKey } from 'react-query';

interface AccessListProps {
  data: ServiceAccess[];
  queryKey: QueryKey;
}

const AccessList: React.FC<AccessListProps> = ({ data, queryKey }) => {
  const productsDict = groupBy(data, (d) => d.productEnvironment?.product.id);
  const products = reduce(data, (result, value, key) => {
      console.log(JSON.stringify(value)+  " : " + key)
    result.filter(a => a.id == value.productEnvironment?.product.id).length == 0 && result.push(value.productEnvironment?.product)
    return result
  }, [])
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
