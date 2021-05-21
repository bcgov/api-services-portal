import * as React from 'react';
import {
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { FaCog, FaTrash } from 'react-icons/fa';
import NamespaceDelete from '@/components/namespace-delete';

interface NamespaceActionsProps {
  name: string;
}

const NamespaceActions: React.FC<NamespaceActionsProps> = ({ name }) => {
  const [namespaceToDelete, setNamespaceToDelete] = React.useState<
    string | null
  >(null);
  const handleDelete = React.useCallback(() => {
    setNamespaceToDelete(name);
  }, [name, setNamespaceToDelete]);
  const handleCancel = React.useCallback(() => {
    setNamespaceToDelete(null);
  }, [setNamespaceToDelete]);

  return (
    <>
      {namespaceToDelete && (
        <NamespaceDelete name={namespaceToDelete} onCancel={handleCancel} />
      )}
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
    </>
  );
};

export default NamespaceActions;
