import * as React from 'react';
import { Badge, Button, useDisclosure } from '@chakra-ui/react';
import ResourcesManagerDialog from './resources-manager-dialog';

interface ResourcesManagerProps {
  id: string;
}

const ResourcesManager: React.FC<ResourcesManagerProps> = ({ id }) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Button
        onClick={onOpen}
        colorScheme="green"
        rightIcon={<Badge colorScheme="green">4</Badge>}
      >
        Access Requests
      </Button>
      <ResourcesManagerDialog open={isOpen} onClose={onClose} />
    </>
  );
};

export default ResourcesManager;
