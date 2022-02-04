import * as React from 'react';
import {
  Box,
  BoxProps,
  Button,
  Grid,
  GridItem,
  Icon,
  Select,
  Tag,
  TagCloseButton,
  Text,
  useDisclosure,
  useToast,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { RiFilterFill } from 'react-icons/ri';
import { FaSave, FaTimes } from 'react-icons/fa';
import { uid } from 'react-uid';

interface FiltersProps extends BoxProps {}

const Filters: React.FC<FiltersProps> = ({ ...props }) => {
  const { isOpen, onClose, onOpen, onToggle } = useDisclosure();
  const [filters, setFilters] = React.useState<string[]>([]);
  const toast = useToast();

  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const filterType = form.get('type');
      const filterValue = form.get('value');
      const newFilter = `${filterType}=${filterValue}`;
      setFilters((state) => [...state, newFilter]);
      onClose();
    },
    [onClose]
  );
  const handleRemove = React.useCallback(
    (index: number) => () => {
      setFilters((state) => state.filter((_, i) => index !== i));
    },
    []
  );
  const handleSave = React.useCallback(() => {
    onClose();
    toast({
      status: 'success',
      description: 'Filters saved',
    });
  }, [onClose, toast]);
  const handleClear = React.useCallback(() => {
    setFilters([]);
    toast({
      status: 'success',
      description: 'Filters cleared',
    });
  }, [toast]);

  return (
    <Box bgColor="white" {...props} py={5} px={9}>
      <Grid
        as="form"
        mb={4}
        gap={4}
        templateColumns="auto 1fr 1fr auto"
        onSubmit={handleSubmit}
      >
        <Button
          isDisabled={isOpen}
          leftIcon={<Icon as={RiFilterFill} />}
          onClick={onOpen}
          variant="secondary"
        >
          Add Filter
        </Button>
        {isOpen && (
          <>
            <Select name="type">
              <option value="Product">Product</option>
              <option value="Role">Role</option>
              <option value="Scope">Scope</option>
            </Select>
            <Select name="value">
              <option value="Pharmanet Electronic Processing">
                Pharmanet Electronic Processing
              </option>
              <option value="System/Patient*">System/Patient*</option>
              <option value="api_owner">api_owner</option>
            </Select>
            <GridItem>
              <Button type="submit">Apply</Button>
              <Button
                type="reset"
                leftIcon={<Icon as={FaTimes} />}
                variant="ghost"
                onClick={onToggle}
              >
                Cancel
              </Button>
            </GridItem>
          </>
        )}
      </Grid>
      <Box>
        {filters.length === 0 && (
          <Text fontSize="small" fontStyle="italic" color="bc-component">
            Filtered tags will appear here
          </Text>
        )}
        {filters.length > 0 && (
          <Grid gap={4} templateColumns="1fr auto">
            <GridItem d="flex" alignItems="center">
              <Wrap>
                {filters.map((f, index) => (
                  <WrapItem key={uid(f)}>
                    <Tag variant="outline">
                      {f}
                      <TagCloseButton onClick={handleRemove(index)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </GridItem>
            <GridItem>
              <Button
                color="bc-blue"
                leftIcon={<Icon as={FaSave} />}
                variant="ghost"
                size="sm"
                onClick={handleSave}
              >
                Save
              </Button>
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
