import * as React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
} from '@chakra-ui/react';
import { useAuth } from '@/shared/services/auth';

const CompleteProfile: React.FC = () => {
  const form = React.useRef(null);
  const { user } = useAuth();
  const { isOpen, onClose } = useDisclosure({
    isOpen: !user?.email,
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (form.current?.checkValidity()) {
      onClose();
    }
  }
  function handleSave() {
    if (form.current?.checkValidity()) {
      form.current.requestSubmit();
    } else {
      form.current?.elements.email.reportValidity();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Complete Your Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form ref={form} onSubmit={handleSubmit}>
            <FormControl mb={8}>
              <FormLabel>Name</FormLabel>
              <Input isReadOnly name="name" id="name" value={user.name} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email address</FormLabel>
              <FormHelperText>
                This is to notify you when your API access request has been
                approved
              </FormHelperText>
              <Input type="email" name="email" id="email" />
            </FormControl>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSave}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CompleteProfile;
