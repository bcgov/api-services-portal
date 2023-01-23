import * as React from 'react';
import {
  Button,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Center,
} from '@chakra-ui/react';
import { FaCog } from 'react-icons/fa';
import { useAuth } from '@/shared/services/auth';
import { useQueryClient } from 'react-query';

const DevMenu = () => {
  const client = useQueryClient();
  const handlePersonaSelect = (name: string) => async () => {
    const req = await fetch(`/dev/change-persona/${name}`, {
      method: 'put',
    });
    client.invalidateQueries();
  };
  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={Button}
        px={1}
        variant="ghost"
        _hover={{ textDecoration: 'none' }}
        _active={{ outline: 'none' }}
      >
        <Center>
          <Icon
            aria-label="chevron down icon"
            ml={2}
            as={FaCog}
            color="white"
          />
        </Center>
      </MenuButton>
      <MenuList borderRadius={0}>
        <MenuItem onClick={handlePersonaSelect('harley')}>Use Harley</MenuItem>
        <MenuItem onClick={handlePersonaSelect('mark')}>Use Mark</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default DevMenu;
