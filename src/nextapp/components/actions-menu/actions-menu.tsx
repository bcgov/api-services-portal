import * as React from 'react';
import { Icon, Menu, MenuButton, MenuList, MenuProps } from '@chakra-ui/react';
import { IoEllipsisHorizontal } from 'react-icons/io5';

interface ActionsMenuProps extends MenuProps {
  children: React.ReactNode;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ children, ...rest }) => {
  return (
    <Menu gutter={1} {...rest}>
      <MenuButton
        px={3}
        py={2}
        transition="all 0.2s"
        borderRadius={4}
        borderWidth="2px"
        borderColor="transparent"
        color="bc-component"
        variant="ghost"
        data-testid={rest['data-testid']}
        _hover={{ color: 'bc-blue', bgColor: '#00336505' }}
        _expanded={{ color: 'bc-blue', borderColor: 'none' }}
        _focus={{ boxShadow: 'none', bgColor: '#00336505' }}
      >
        <Icon as={IoEllipsisHorizontal} aria-label="action menu icon" />
      </MenuButton>
      <MenuList>{children}</MenuList>
    </Menu>
  );
};

export default ActionsMenu;
