import * as React from 'react';
import {
  Button,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';

import AccessRequestCredentials from './access-request-credentials';
import { FaKey } from 'react-icons/fa';

interface GenerateCredentialsDialogProps {
  id: string;
  open?: boolean;
}

const GenerateCredentialsDialog: React.FC<GenerateCredentialsDialogProps> = ({
  id,
  open,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        leftIcon={<Icon as={FaKey} />}
        variant="secondary"
        mr={4}
        onClick={onOpen}
        data-testid="generate-credentials-button"
      >
        Collect Credentials
      </Button>
      <Modal
        isOpen={open || isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="xl"
      >
        <ModalOverlay />
        <ModalContent minW="75%">
          <ModalHeader>Your Credentials</ModalHeader>
          <ModalBody>
            <AccessRequestCredentials id={id} />
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={onClose}
              data-testid="generate-credentials-done-button"
            >
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GenerateCredentialsDialog;
