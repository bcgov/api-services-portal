import * as React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';

interface AuthorizationProfileDialogProps {
  id?: string;
  open: boolean;
  onClose: () => void;
}

const AuthorizationProfileDialog: React.FC<AuthorizationProfileDialogProps> = ({
  id,
  open,
  onClose,
}) => {
  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>MoH Resource Server {id}</ModalHeader>
      </ModalContent>
    </Modal>
  );
};

export default AuthorizationProfileDialog;
