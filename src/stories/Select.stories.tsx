import * as React from 'react';
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Select,
  VStack,
} from '@chakra-ui/react';

export default {
  title: 'BCGov/Dropdown',
};

// NOTE: The focus dropdown is for demonstration purpose only. See theme.ts for implementation
export const Dropdown = () => (
  <VStack spacing={4}>
    <Select placeholder="Select One">
      <option>Option 1</option>
      <option>Option 2</option>
    </Select>
    <Select
      placeholder="Focused Dropdown"
      borderColor="bc-blue-alt"
      boxShadow="lg"
    >
      <option>Option 1</option>
      <option>Option 2</option>
    </Select>
    <Select isDisabled placeholder="Disabled Dropdown">
      <option>Option 1</option>
      <option>Option 2</option>
    </Select>
    <Select isInvalid placeholder="Invalid Dropdown">
      <option>Option 1</option>
      <option>Option 2</option>
    </Select>
  </VStack>
);

export const DropdownHelpText = () => (
  <FormControl>
    <FormLabel>Dropdown with Help Text</FormLabel>
    <FormHelperText>Include helpful instructions here</FormHelperText>
    <Select placeholder="Select One" variant="bc-input">
      <option>Option 1</option>
      <option>Option 2</option>
    </Select>
  </FormControl>
);

export const DropdownErrorMessage = () => (
  <FormControl isInvalid>
    <FormLabel>Dropdown with Error</FormLabel>
    <FormHelperText>
      Looks like the helpful text was not read ;-)
    </FormHelperText>
    <Select placeholder="Error Dropdown" variant="bc-input">
      <option>Option 1</option>
      <option>Option 2</option>
    </Select>
    <FormErrorMessage>There was an error</FormErrorMessage>
  </FormControl>
);
