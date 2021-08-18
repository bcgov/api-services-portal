import * as React from 'react';
import {
  Radio,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  VStack,
} from '@chakra-ui/react';

export default {
  title: 'BCGov/Radio',
};

export const DefaultRadio = () => (
  <VStack spacing={4}>
    <Radio>Radio</Radio>
    <Radio defaultIsChecked>Radio</Radio>
  </VStack>
);
