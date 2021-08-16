import * as React from 'react';
import { Button, VStack } from '@chakra-ui/react';

export default {
  title: 'BCGov/Button',
};

export const Primary = () => (
  <VStack spacing={4}>
    <Button>Primary</Button>
    <Button isActive>Active</Button>
    <Button isDisabled>Disabled</Button>
  </VStack>
);
export const Secondary = () => (
  <VStack spacing={4}>
    <Button variant="secondary">Secondary</Button>
    <Button isActive variant="secondary">
      Active
    </Button>
    <Button isDisabled variant="secondary">
      Disabled
    </Button>
  </VStack>
);
export const HeaderButton = () => (
  <VStack spacing={4}>
    <Button variant="header">Header Button</Button>
    <Button isActive variant="header">
      Active
    </Button>
    <Button isDisabled variant="header">
      Disabled
    </Button>
  </VStack>
);
