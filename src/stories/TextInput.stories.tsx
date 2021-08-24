import * as React from 'react';
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  VStack,
} from '@chakra-ui/react';

export default {
  title: 'BCGov/TextInput',
};

export const TextInput = () => (
  <VStack spacing={4}>
    <Input placeholder="Text Input" variant="bc-input" />
    <Input isDisabled placeholder="Disabled Text Input" variant="bc-input" />
    <Input isInvalid placeholder="Invalid Text Input" variant="bc-input" />
  </VStack>
);

export const WithLabel = () => (
  <FormControl isRequired mb={4}>
    <FormLabel>Application Name</FormLabel>
    <Input placeholder=" Name" name="name" variant="bc-input" />
  </FormControl>
);

export const WithHelpText = () => (
  <FormControl isRequired mb={4}>
    <FormLabel>Application Name</FormLabel>
    <FormHelperText>Helper text goes here</FormHelperText>
    <Input placeholder=" Name" name="name" variant="bc-input" />
  </FormControl>
);

export const WithErrorMessage = () => (
  <FormControl isInvalid mb={4}>
    <FormLabel>Postal Code</FormLabel>
    <Input placeholder="e.g. V9L 1P1" name="postal" variant="bc-input" />
    <FormErrorMessage>Invalid Postal Code</FormErrorMessage>
  </FormControl>
);
