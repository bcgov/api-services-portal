import * as React from 'react';
import { Box } from '@chakra-ui/react';
import groupBy from 'lodash/groupBy';
import { AccessRequest, ServiceAccess } from '@/shared/types/query.types';
import AccessListItem from './access-list-item';
import { QueryKey } from 'react-query';

interface AccessListProps {
  approved: ServiceAccess[];
  requested: AccessRequest[];
  queryKey: QueryKey;
}

const AccessList: React.FC<AccessListProps> = ({
  approved,
  requested,
  queryKey,
}) => {
  const { products, productsDict } = React.useMemo(() => {
    const data = [...approved, ...requested];
    const productsDict = groupBy(data, (d) => d.productEnvironment?.product.id);
    const products = data.reduce((memo, value) => {
      if (
        memo.some((a) => a.id === value.productEnvironment?.product.id) ===
        false
      ) {
        memo.push(value.productEnvironment?.product);
      }
      return memo;
    }, []);

    return {
      products,
      productsDict,
    };
  }, [approved, requested]);

  return (
    <Box data-testid="access-list">
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
