import * as React from 'react';
import {
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  Button,
  Icon,
} from '@chakra-ui/react';
import { FaExchangeAlt } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { Environment } from '@/shared/types/query.types';

interface EnvironmentNavProps {
  data: Environment[];
  id: string;
}

const EnvironmentNav: React.FC<EnvironmentNavProps> = ({ data = [], id }) => {
  const router = useRouter();
  const onSelect = (id: string) => () => {
    router.push(`/products/${id}`);
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="tertiary"
        size="sm"
        leftIcon={<Icon as={FaExchangeAlt} />}
        isDisabled={data?.length < 2}
      >
        Switch Environment
      </MenuButton>
      <MenuList>
        {data
          .filter((d) => d.id !== id)
          .map((d) => (
            <MenuItem key={d.id} onClick={onSelect(d.id)}>
              {d.name}
            </MenuItem>
          ))}
      </MenuList>
    </Menu>
  );
};

export default EnvironmentNav;
