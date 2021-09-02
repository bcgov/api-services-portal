import * as React from 'react';
import { Icon, Menu, MenuButton, MenuList, Placement } from '@chakra-ui/react';
import { IoEllipsisHorizontal } from 'react-icons/io5';

interface ActionsMenuProps {
  children: React.ReactNode;
  placement?: Placement;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({
  children,
  placement = 'bottom-end',
}) => {
  return (
    <Menu gutter={1} placement={placement}>
      <MenuButton
        px={4}
        py={2}
        transition="all 0.2s"
        borderRadius={4}
        borderWidth="2px"
        borderColor="transparent"
        color="bc-component"
        _hover={{ color: 'bc-blue', bgColor: 'white' }}
        _expanded={{ color: 'bc-blue', borderColor: 'bc-component' }}
        _focus={{ boxShadow: 'outline' }}
      >
        <Icon as={IoEllipsisHorizontal} />
      </MenuButton>
      <MenuList>{children}</MenuList>
    </Menu>
  );
};

export default ActionsMenu;
