import * as React from 'react';
import { FormControl, FormLabel, HStack, Select } from '@chakra-ui/react';

import ProductsFilter from './products-filter';

type Filters = 'all' | 'up' | 'down';

interface ServicesFiltersProps {}

const ServicesFilters: React.FC<ServicesFiltersProps> = () => {
  const [filter, setFilter] = React.useState<Filters>('all');
  const [product, setProduct] = React.useState<string>('');
  const onFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value as Filters);
  };
  return (
    <HStack display="flex" bgColor="gray.200" mb={4} p={4}>
      <FormControl>
        <FormLabel>Filter by Product</FormLabel>
        <ProductsFilter onChange={setProduct} selected={product} />
      </FormControl>
      <FormControl>
        <FormLabel>Filter by Environment</FormLabel>
        <Select onChange={onFilterChange} variant="bc-input" size="sm">
          <option value="">All Environments</option>
          <option value="dev">Development</option>
          <option value="prod">Production</option>
          <option value="test">Test</option>
          <option value="sandbox">Sandbox</option>
          <option value="other">Other</option>
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel>Filter by State</FormLabel>
        <Select
          onChange={onFilterChange}
          value={filter}
          variant="bc-input"
          size="sm"
        >
          <option value="">All Services</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </FormControl>
    </HStack>
  );
};

export default ServicesFilters;
