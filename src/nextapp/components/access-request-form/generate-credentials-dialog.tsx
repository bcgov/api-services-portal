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
import { useQueryClient } from 'react-query';

import AccessRequestCredentials from './access-request-credentials';
import { FaKey } from 'react-icons/fa';

interface GenerateCredentialsDialogProps {
  id: string;
  open?: boolean;
  regenerate?: boolean;
}

const GenerateCredentialsDialog: React.FC<GenerateCredentialsDialogProps> = ({
  id,
  open,
  regenerate,
}) => {
  const client = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleClose = React.useCallback(() => {
    client.invalidateQueries('allServiceAccesses');
    onClose();
  }, [client, onClose]);

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
        onClose={handleClose}
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
              onClick={handleClose}
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
