import * as React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalHeader,
} from '@chakra-ui/react';
import { UmaPermissionTicket } from '@/shared/types/query.types';
import { QueryKey } from 'react-query';
import UsersAccessList from '../users-access-list';

interface ResourcesManagerDialogProps {
  prodEnvId: string;
  data: UmaPermissionTicket[];
  open: boolean;
  onClose: () => void;
  queryKey: QueryKey;
  resourceId: string;
}

const ResourcesManagerDialog: React.FC<ResourcesManagerDialogProps> = ({
  prodEnvId,
  data,
  open,
  onClose,
  queryKey,
  resourceId,
}) => {
  return (
    <Modal isOpen={open} onClose={onClose} scrollBehavior="inside" size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Resource Sharing Controls</ModalHeader>
        <ModalBody p={0}>
          <UsersAccessList
            prodEnvId={prodEnvId}
            data={data}
            queryKey={queryKey}
            resourceId={resourceId}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} variant="primary">
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ResourcesManagerDialog;
