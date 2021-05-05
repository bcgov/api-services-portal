import * as React from 'react';
import {
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FaCog, FaTrash } from 'react-icons/fa';
import { useMutation, useQueryClient } from 'react-query';
import { restApi } from '@/shared/services/api';
import { useRouter } from 'next/router';

interface NamespaceActionsProps {
  name: string;
}

const NamespaceActions: React.FC<NamespaceActionsProps> = ({ name }) => {
  const client = useQueryClient();
  const router = useRouter();
  const toast = useToast();
  const mutation = useMutation((name: string) =>
    restApi(`/gw/api/namespaces/${name}`, {
      method: 'DELETE',
      body: JSON.stringify({ name: name }),
    })
  );

  const handleDelete = React.useCallback(async () => {
    try {
      await mutation.mutateAsync(name);
      router.push('/manager');
      client.invalidateQueries();
      toast({
        title: ' Namespace Deleted',
        status: 'success',
      });
    } catch (err) {
      toast({
        title: 'Delete Namespace Failed',
        status: 'error',
      });
    }
  }, [client, mutation, name, router, toast]);

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Namespace Menu"
        icon={<Icon as={FaCog} />}
        variant="primary"
      />
      <MenuList>
        <MenuItem icon={<Icon as={FaTrash} />} onClick={handleDelete}>
          Delete Namespace
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default NamespaceActions;
