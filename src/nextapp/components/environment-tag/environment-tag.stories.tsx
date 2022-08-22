import * as React from 'react';
import { VStack } from '@chakra-ui/react';

import EnvironmentTag from './environment-tag';

export default {
  title: 'APS/EnvironmentTag',
};

export const Variations = () => (
  <VStack spacing={4}>
    <EnvironmentTag name="dev" />
    <EnvironmentTag name="prod" />
    <EnvironmentTag name="test" />
    <EnvironmentTag name="sandbox" />
    <EnvironmentTag name="other" />
    <EnvironmentTag name="conformance" />
  </VStack>
);
