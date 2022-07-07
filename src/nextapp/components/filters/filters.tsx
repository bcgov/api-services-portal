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
  useToast,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import { uid } from 'react-uid';

interface FiltersProps extends BoxProps {
  cacheId: string;
  data: unknown;
  filterTypeOptions: { name: string; value: string }[];
  filterValueOptions?: Record<string, { name: string; value: string }[]>;
  onAddFilter: (key: string, value: string) => void;
  onClearFilters: () => void;
  onRemoveFilter: (key: string, value: string) => void;
}

const Filters: React.FC<FiltersProps> = ({
  cacheId,
  children,
  data,
  filterTypeOptions,
  filterValueOptions,
  onAddFilter,
  onClearFilters,
  onRemoveFilter,
  ...props
}) => {
  const filters: string[] = React.useMemo(() => {
    const keys = Object.keys(data);
    const result: string[] = [];

    keys.forEach((k) => {
      const value = data[k];
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((v) => {
          result.push(`${k} = ${v}`);
        });
      }
    });

    return result;
  }, [data]);
  const [filterType, setFilterType] = React.useState<string>(
    filterTypeOptions[0]?.value ?? ''
  );
  const toast = useToast();

  // Events
  const handleFilterTypeSelect = (event) => {
    setFilterType(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const filterType = form.get('type');
    const filterValue = form.get('value');
    onAddFilter(filterType as string, filterValue as string);
    event.currentTarget.reset();
    toast({
      title: 'Filters Added',
      status: 'success',
    });
  };
  const handleRemove = (filter: string) => () => {
    const [key, value] = filter.split(' = ');
    onRemoveFilter(key, value);
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
          <Select name="value">
            {filterValueOptions[filterType]?.map((f) => (
              <option key={uid(f)} value={f.value}>
                {f.name}
              </option>
            ))}
          </Select>
        )}
        <GridItem>
          <Button type="submit">Apply</Button>
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
                  <WrapItem key={uid(f)}>
                    <Tag variant="outline">
                      {f}
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
