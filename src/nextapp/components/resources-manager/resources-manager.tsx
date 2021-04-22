import * as React from 'react';
import { Badge, Button, Icon, useDisclosure } from '@chakra-ui/react';
import ResourcesManagerDialog from './resources-manager-dialog';
import { UmaPermissionTicket } from '@/shared/types/query.types';
import { FaUserPlus } from 'react-icons/fa';

interface ResourcesManagerProps {
  id: string;
  data: UmaPermissionTicket[];
}

const ResourcesManager: React.FC<ResourcesManagerProps> = ({ data, id }) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Button
        onClick={onOpen}
        colorScheme="green"
        leftIcon={<Icon as={FaUserPlus} />}
        rightIcon={<Badge colorScheme="green">{data.length}</Badge>}
      >
        Access Requests
      </Button>
      <ResourcesManagerDialog data={data} open={isOpen} onClose={onClose} />
    </>
  );
};

export default ResourcesManager;
