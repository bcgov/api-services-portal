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
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { RiFilterFill } from 'react-icons/ri';
import { FaSave, FaTimes } from 'react-icons/fa';

interface FiltersProps extends BoxProps {}

const Filters: React.FC<FiltersProps> = ({ ...props }) => {
  const [applied, setApplied] = React.useState(false);

  const handleApply = React.useCallback(() => {
    setApplied(true);
  }, []);

  return (
    <Box bgColor="white" {...props} py={5} px={9}>
      <Grid mb={4} gap={4} templateColumns="auto 1fr 1fr auto">
        <GridItem>
          <Button leftIcon={<Icon as={RiFilterFill} />} variant="secondary">
            Add Filter
          </Button>
        </GridItem>
        <GridItem>
          <Select>
            <option>Product</option>
          </Select>
        </GridItem>
        <GridItem>
          <Select>
            <option>Product</option>
          </Select>
        </GridItem>
        <GridItem>
          <Button onClick={handleApply}>Apply</Button>
          <Button
            leftIcon={<Icon as={FaTimes} />}
            variant="ghost"
            color="bc-blue"
          >
            Cancel
          </Button>
        </GridItem>
      </Grid>
      <Box>
        {!applied && (
          <Text fontSize="small" fontStyle="italic" color="bc-component">
            Filtered tags will appear here
          </Text>
        )}
        {applied && (
          <Grid gap={4} templateColumns="1fr auto">
            <GridItem>
              <Wrap>
                <WrapItem>
                  <Tag variant="outline">
                    Prodcut = Hello
                    <TagCloseButton />
                  </Tag>
                </WrapItem>
              </Wrap>
            </GridItem>
            <GridItem>
              <Button
                color="bc-blue"
                leftIcon={<Icon as={FaSave} />}
                variant="ghost"
                size="sm"
              >
                Save
              </Button>
              <Button
                color="bc-blue"
                leftIcon={<Icon as={FaTimes} />}
                variant="ghost"
                size="sm"
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
