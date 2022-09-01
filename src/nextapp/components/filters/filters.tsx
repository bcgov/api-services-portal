import * as React from 'react';
import {
  Box,
  BoxProps,
  Button,
  Grid,
  GridItem,
  Heading,
  Icon,
  Select,
  Tag,
  TagCloseButton,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import { uid } from 'react-uid';

interface LabelValue {
  labelGroup: string;
  value: string;
}

interface FilterTag {
  id: string;
  value: string;
}

interface FiltersProps extends BoxProps {
  data: unknown;
  filterTypeOptions: { name: string; value: string }[];
  filterValueOptions?: Record<string, { name: string; value: string }[]>;
  onAddFilter: (
    key: string,
    payload: Record<string, string | LabelValue>
  ) => void;
  onClearFilters: () => void;
  onRemoveFilter: (key: string, value: string) => void;
}

const Filters: React.FC<FiltersProps> = ({
  children,
  data,
  filterTypeOptions,
  filterValueOptions,
  onAddFilter,
  onClearFilters,
  onRemoveFilter,
  ...props
}) => {
  const filters: FilterTag[] = React.useMemo(() => {
    const keys = Object.keys(data);
    const result: FilterTag[] = [];

    keys.forEach((k) => {
      const value = data[k];
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((v) => {
          const name = k === 'labels' ? `${v.name}:${v.value.value}` : v.name;
          result.push({ id: v.id, value: `${k} = ${name}` });
        });
      }
    });

    return result;
  }, [data]);
  const [filterType, setFilterType] = React.useState<string>(
    filterTypeOptions[0]?.value ?? ''
  );

  // Events
  const handleFilterTypeSelect = (event) => {
    setFilterType(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const filterType = form.get('type') as string;
    let filterValue: string | LabelValue = form.get('value') as string;
    const filterName =
      event.target.querySelector(
        `select[name="value"] option[value="${filterValue}"]`
      )?.textContent ?? event.target.querySelector('input').value;
    if (filterType === 'labels') {
      const value = form.get('labelValue') as string;
      filterValue = {
        labelGroup: filterValue,
        value,
      };
    }
    onAddFilter(filterType, { value: filterValue, name: filterName });
    event.currentTarget.reset();
  };
  const handleRemove = (filter: FilterTag) => () => {
    const [key] = filter.value.split(' = ');
    onRemoveFilter(key, filter.id);
  };
  const handleClear = () => {
    onClearFilters();
  };
  return (
    <Box bgColor="white" {...props} py={5} px={9}>
      <Grid
        as="form"
        mb={4}
        gap={4}
        templateColumns="auto 1fr 1fr auto"
        onSubmit={handleSubmit}
      >
        <GridItem d="flex" alignItems="center">
          <Heading size="sm" fontWeight="normal">
            Filter By
          </Heading>
        </GridItem>
        <Select
          name="type"
          onChange={handleFilterTypeSelect}
          value={filterType}
          data-testid="filter-type-select"
        >
          {filterTypeOptions.map((f) => (
            <option key={uid(f)} value={f.value}>
              {f.name}
            </option>
          ))}
        </Select>
        {!filterValueOptions &&
          children &&
          React.Children.map(children, (c) =>
            React.cloneElement(c as React.ReactElement<any>, {
              value: filterType,
            })
          )}
        {filterValueOptions && (
          <Select name="value" data-testid="filters-value-select">
            {filterValueOptions[filterType]?.map((f) => (
              <option key={uid(f)} value={f.value}>
                {f.name}
              </option>
            ))}
          </Select>
        )}
        <GridItem>
          <Button type="submit" data-testid="btn-filter-apply">
            Apply
          </Button>
        </GridItem>
      </Grid>
      <Box>
        {filters?.length === 0 && (
          <Text fontSize="small" fontStyle="italic" color="bc-component">
            Filtered tags will appear here
          </Text>
        )}
        {filters?.length > 0 && (
          <Grid gap={4} templateColumns="1fr auto">
            <GridItem d="flex" alignItems="center">
              <Wrap>
                {filters.map((f) => (
                  <WrapItem key={uid(f.id)}>
                    <Tag variant="outline">
                      {f.value}
                      <TagCloseButton onClick={handleRemove(f)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </GridItem>
            <GridItem>
              <Button
                color="bc-blue"
                leftIcon={<Icon as={FaTimes} />}
                variant="ghost"
                size="sm"
                onClick={handleClear}
                data-testid="btn-filter-clear-all"
              >
                Clear All
              </Button>
            </GridItem>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Filters;
