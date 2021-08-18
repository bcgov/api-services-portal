import * as React from 'react';
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Switch,
  VStack,
} from '@chakra-ui/react';

export default {
  title: 'BCGov/Switch',
};

export const DefaultRadio = () => (
  <VStack spacing={4}>
    <Switch>Switch</Switch>
    <Switch defaultIsChecked>Switch</Switch>
  </VStack>
);
