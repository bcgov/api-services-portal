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
  const formRef = React.useRef<HTMLFormElement>();

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (event.currentTarget?.checkValidity()) {
        const formData = new FormData(event.currentTarget);
        onClose();
      }
    },
    [onClose]
  );
  const handleSubmitClick = React.useCallback(() => {
    formRef?.current.requestSubmit();
  }, []);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage Group Labels</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form ref={formRef} onSubmit={handleSubmit}>
            <FormControl isRequired>
              <FormLabel>Group labels</FormLabel>
              <TagInput name="tags" />
            </FormControl>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmitClick}>Save Changes</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LabelDialog;
