import * as React from 'react';
import { Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';

interface AddEnvironmentProps {
  children: React.ReactNode;
  packageName: string;
}

const AddEnvironment: React.FC<AddEnvironmentProps> = ({
  children,
  packageName,
}) => {
  return (
    <Menu>
      <MenuButton>{children}</MenuButton>
      <MenuList>
        <MenuItem value="dev">Development</MenuItem>
        <MenuItem value="sandbox">Sandbox</MenuItem>
        <MenuItem value="test">Test</MenuItem>
        <MenuItem value="prod">Production</MenuItem>
        <MenuItem value="other">Other</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default AddEnvironment;
