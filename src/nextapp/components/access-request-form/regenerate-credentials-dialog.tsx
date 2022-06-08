import * as React from 'react';
import {
  Button,
  Heading,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';

import AccessRequestCredentials from './access-request-credentials';
import { FaKey } from 'react-icons/fa';

interface RegenerateCredentialsDialogProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

const RegenerateCredentialsDialog: React.FC<RegenerateCredentialsDialogProps> = ({
  id,
  isOpen,
  onClose,
}) => {
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="xl"
      >
        <ModalOverlay />
        <ModalContent minW="75%">
          <ModalHeader>Regenerate Credentials</ModalHeader>
          <ModalBody>
            <AccessRequestCredentials regenerate id={id} />
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={onClose}
              data-testid="regenerate-credentials-done-button"
            >
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RegenerateCredentialsDialog;
