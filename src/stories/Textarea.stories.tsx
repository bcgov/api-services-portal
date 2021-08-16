import * as React from 'react';
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Textarea,
  VStack,
} from '@chakra-ui/react';

export default {
  title: 'BCGov/Textarea',
};

export const TextArea = () => (
  <VStack spacing={4}>
    <Textarea placeholder="Add requirements here" variant="bc-input" />
    <Textarea isDisabled placeholder="Disabled Dropdown" variant="bc-input" />
    <Textarea isInvalid placeholder="Invalid Dropdown" variant="bc-input" />
  </VStack>
);

export const WithLabel = () => (
  <FormControl isRequired mb={4}>
    <FormLabel>Requirements</FormLabel>
    <Textarea placeholder="Add requirements here" variant="bc-input" />
  </FormControl>
);

export const WithHelperText = () => (
  <FormControl isRequired isInvalid mb={4}>
    <FormLabel>Requirements</FormLabel>
    <FormHelperText>Helper text goes here</FormHelperText>
    <Textarea placeholder="Add requirements here" variant="bc-input" />
  </FormControl>
);

export const WithErrorMessage = () => (
  <FormControl isRequired isInvalid mb={4}>
    <FormLabel>Requirements</FormLabel>
    <Textarea placeholder="Add requirements here" variant="bc-input" />
    <FormErrorMessage>There was an error</FormErrorMessage>
  </FormControl>
);
