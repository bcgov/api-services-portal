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
import { useApiMutation } from '@/shared/services/api';
import { gql } from 'graphql-request';
import { useQueryClient } from 'react-query';

const CompleteProfile: React.FC = () => {
  const form = React.useRef(null);
  const mutate = useApiMutation(mutation);
  const client = useQueryClient();
  const { user } = useAuth();
  const { isOpen, onClose } = useDisclosure({
    isOpen: !user?.email,
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (form.current?.checkValidity()) {
      const data = new FormData(form.current);
      const email = data.get('email');
      await mutate.mutateAsync({ email });
      client.invalidateQueries('user');
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

  if (user?.provider !== 'bcsc' || !user) {
    return <></>;
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

const mutation = gql`
  mutation UpdateUserEmail($email: String!) {
    updateEmail(email: $email) {
      email
    }
  }
`;
