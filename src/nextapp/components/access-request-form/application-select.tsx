import * as React from 'react';
import {
  Button,
  ButtonGroup,
  Collapse,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Icon,
  Input,
  Select,
  useDisclosure,
} from '@chakra-ui/react';
import { FaPlusCircle } from 'react-icons/fa';

const ApplicationSelect: React.FC = () => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <>
      <Grid templateColumns="1fr 1fr" gap={4}>
        <GridItem>
          <FormControl>
            <FormLabel>Applications</FormLabel>
            <FormHelperText>
              Select an application to consume the API
            </FormHelperText>
            <Select>
              <option>App</option>
            </Select>
          </FormControl>
        </GridItem>
        <GridItem d="flex" alignItems="flex-end">
          <Button
            leftIcon={<Icon as={FaPlusCircle} />}
            px={2}
            onClick={onToggle}
            variant="flat"
          >
            Create Application
          </Button>
        </GridItem>
      </Grid>
      <Collapse animateOpacity in={isOpen}>
        <Grid templateColumns="1fr 1fr" gap={4} templateRows="repeat(1fr, 3)">
          <GridItem>
            <FormControl isRequired>
              <FormLabel>Application Name</FormLabel>
              <Input />
            </FormControl>
          </GridItem>
          <GridItem>
            <FormControl>
              <FormLabel>Description (optional)</FormLabel>
              <Input />
            </FormControl>
          </GridItem>
          <GridItem>
            <ButtonGroup>
              <Button variant="secondary" onClick={onToggle}>
                Cancel
              </Button>
              <Button onClick={onToggle}>Create</Button>
            </ButtonGroup>
          </GridItem>
        </Grid>
      </Collapse>
    </>
  );
};

export default ApplicationSelect;
