import * as React from 'react';
import { Badge, Button, Icon, useDisclosure } from '@chakra-ui/react';
import ResourcesManagerDialog from './resources-manager-dialog';
import { UmaPermissionTicket } from '@/shared/types/query.types';
import { FaUserPlus } from 'react-icons/fa';
import { QueryKey } from 'react-query';

interface ResourcesManagerProps {
  prodEnvId: string;
  data: UmaPermissionTicket[];
  queryKey: QueryKey;
  resourceId: string;
}

const ResourcesManager: React.FC<ResourcesManagerProps> = ({
  prodEnvId,
  data,
  queryKey,
  resourceId,
}) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Button
        colorScheme="green"
        leftIcon={<Icon as={FaUserPlus} />}
        onClick={onOpen}
        rightIcon={<Badge colorScheme="green">{data.length}</Badge>}
      >
        Access Requests
      </Button>
      <ResourcesManagerDialog
        prodEnvId={prodEnvId}
        data={data}
        open={isOpen}
        onClose={onClose}
        queryKey={queryKey}
        resourceId={resourceId}
      />
    </>
  );
};

export default ResourcesManager;
