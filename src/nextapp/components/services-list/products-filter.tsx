import * as React from 'react';
import { gql } from 'graphql-request';
import { Select } from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';

const query = gql`
  query GET {
    allProducts {
      name
      id
    }
  }
`;

interface ProductsFilterProps {
  onChange: (value: string) => void;
  selected: string;
}

const ProductsFilter: React.FC<ProductsFilterProps> = ({
  onChange,
  selected,
}) => {
  const { data, isSuccess } = useApi(
    'service-list-products',
    { query },
    { suspense: false }
  );
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <Select
      isDisabled={!isSuccess}
      onChange={handleChange}
      value={selected}
      variant="bc-input"
      size="sm"
    >
      <option value="">All Products</option>
      {data?.allProducts.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name}
        </option>
      ))}
    </Select>
  );
};

export default ProductsFilter;
