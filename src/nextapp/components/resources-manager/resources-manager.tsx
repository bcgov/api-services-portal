import * as React from 'react';
import { Box, Tooltip, useDisclosure } from '@chakra-ui/react';
import ResourcesManagerDialog from './resources-manager-dialog';

interface ResourcesManagerProps {
  children: React.ReactNode;
}

const ResourcesManager: React.FC<ResourcesManagerProps> = ({ children }) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Tooltip label="Manage Resource Access">
        <Box as="span" onClick={onOpen} cursor="pointer" role="button">
          {children}
        </Box>
      </Tooltip>
      <ResourcesManagerDialog open={isOpen} onClose={onClose} />
    </>
  );
};

export default ResourcesManager;
