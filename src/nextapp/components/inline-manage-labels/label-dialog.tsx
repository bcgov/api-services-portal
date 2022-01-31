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
  FormLabel,
  FormControl,
} from '@chakra-ui/react';
import TagInput from '../tag-input';

interface LabelDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LabelDialog: React.FC<LabelDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage Group Labels</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired>
            <FormLabel>Group labels</FormLabel>
            <TagInput name="labels" />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button>Save Changes</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LabelDialog;
