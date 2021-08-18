import * as React from 'react';
import { Button, Icon, Text, VStack } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';

export default {
  title: 'BCGov/Button',
};

export const Primary = () => (
  <VStack spacing={4}>
    <Text>Default variant for all Buttons</Text>
    <Button>Primary</Button>
    <Button isActive>Active</Button>
    <Button isDisabled>Disabled</Button>
    <Button leftIcon={<Icon as={FaPlus} />}>With Icon</Button>
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
    <Button leftIcon={<Icon as={FaPlus} />} variant="secondary">
      With Icon
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
    <Button leftIcon={<Icon as={FaPlus} />} variant="header">
      With Icon
    </Button>
  </VStack>
);

export const FlatButton = () => (
  <VStack spacing={4}>
    <Button size="sm" variant="flat">
      Flat Button
    </Button>
    <Button isActive size="sm" variant="flat">
      Active
    </Button>
    <Button isDisabled size="sm" variant="flat">
      Disabled
    </Button>
    <Button leftIcon={<Icon as={FaPlus} />} size="sm" variant="flat">
      With Icon
    </Button>
  </VStack>
);
