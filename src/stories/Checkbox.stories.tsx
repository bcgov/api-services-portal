import * as React from 'react';
import {
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  VStack,
} from '@chakra-ui/react';

export default {
  title: 'BCGov/Checkbox',
};

export const DefaultCheckbox = () => (
  <VStack spacing={4}>
    <Checkbox>Checkbox</Checkbox>
    <Checkbox defaultIsChecked>Checkbox</Checkbox>
  </VStack>
);
