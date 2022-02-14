import * as React from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  ButtonGroup,
} from '@chakra-ui/react';

interface AccessRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const AccessRequestDialog: React.FC<AccessRequestDialogProps> = ({
  isOpen,
  onClose,
  title,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>Hi</ModalBody>

        <ModalFooter>
          <ButtonGroup>
            <Button variant="solid" colorScheme="green">
              Accept
            </Button>
            <Button variant="solid" colorScheme="red">
              Reject
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AccessRequestDialog;
