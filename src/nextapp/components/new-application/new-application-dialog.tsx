import * as React from 'react';
import api from '@/shared/services/api';
import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from 'react-query';
import { gql } from 'graphql-request';

interface NewApplicationDialog {
  open: boolean;
  onClose: () => void;
  userId: string;
}

const NewApplicationDialog: React.FC<NewApplicationDialog> = ({
  open,
  onClose,
  userId,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const applicationMutation = useMutation(
    (payload: { name: string; description: string; owner: string }) =>
      api(mutation, payload)
  );
  const form = React.useRef<HTMLFormElement>();
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createApplication();
  };
  const createApplication = async () => {
    if (form.current) {
      const data = new FormData(form.current);

      if (form.current.checkValidity()) {
        const name = data.get('name') as string;
        const description = data.get('description') as string;
        const res = await applicationMutation.mutateAsync({
          name,
          description,
          owner: userId,
        });

        if (res.errors) {
          toast({
            title: 'Create Application Failed',
            status: 'error',
          });
        } else {
          toast({
            title: `${name} created!`,
            description: 'You can now request access to an API',
            status: 'success',
          });
          queryClient.invalidateQueries('allApplications');
          onClose();
        }
      }
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="4px">
        <ModalHeader>Create Application</ModalHeader>
        <ModalBody>
          <form ref={form} onSubmit={onSubmit}>
            <FormControl isRequired mb={4}>
              <FormLabel>Application Name</FormLabel>
              <Input placeholder=" Name" name="name" variant="bc-input" />
            </FormControl>
            <FormControl isRequired as="fieldset">
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                placeholder="What does your application do?"
                variant="bc-input"
              />
            </FormControl>
          </form>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={createApplication}>
              Create
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NewApplicationDialog;

const mutation = gql`
  mutation Add($name: String!, $owner: ID!, $description: String) {
    createApplication(
      data: {
        name: $name
        description: $description
        owner: { connect: { id: $owner } }
      }
    ) {
      id
    }
  }
`;
