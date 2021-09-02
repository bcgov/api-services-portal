import * as React from 'react';
import { Icon, Menu, MenuButton, MenuList, Placement } from '@chakra-ui/react';
import { FaEllipsisH } from 'react-icons/fa';

interface ActionsMenuProps {
  children: React.ReactNode;
  placement?: Placement;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({
  children,
  placement = 'bottom-end',
}) => {
  return (
    <Menu placement={placement}>
      <MenuButton
        px={4}
        py={2}
        transition="all 0.2s"
        border="none"
        color="bc-component"
        _hover={{ color: 'bc-blue', bgColor: 'white' }}
        _expanded={{ color: 'bc-blue' }}
        _focus={{ boxShadow: 'outline' }}
      >
        <Icon as={FaEllipsisH} />
      </MenuButton>
      <MenuList>{children}</MenuList>
    </Menu>
  );
};

export default ActionsMenu;
