import * as React from 'react';
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
  useToast,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from 'react-query';
import { gql } from 'graphql-request';
import { restApi, useApiMutation } from '@/shared/services/api';

interface NewNamespace {
  isOpen: boolean;
  onClose: () => void;
}

const NewNamespace: React.FC<NewNamespace> = ({ isOpen, onClose }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const createMutation = useApiMutation(mutation);
  const form = React.useRef<HTMLFormElement>();
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleCreateNamespace();
  };
  const handleCreateNamespace = async () => {
    if (form.current) {
      const data = new FormData(form.current);

      if (form.current.checkValidity()) {
        try {
          const name = data.get('name') as string;
          const json = (await createMutation.mutateAsync({
            name,
          })) as { createNamespace: { name: string; id: string } };

          toast({
            title: `Namespace ${json.createNamespace.name} created!`,
            status: 'success',
          });
          queryClient.invalidateQueries();
          toast({
            title: `Switched to  ${json.createNamespace.name} namespace`,
            status: 'success',
          });
          onClose();
        } catch (err) {
          console.log(JSON.stringify(err));
          toast({
            title: 'Namespace Create Failed',
            description: err?.[0]?.message,
            status: 'error',
          });
        }
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="4px">
        <ModalHeader>Create Namespace</ModalHeader>
        <ModalBody>
          <form ref={form} onSubmit={onSubmit}>
            <FormControl isRequired mb={4}>
              <FormLabel>Namespace</FormLabel>
              <Input
                isDisabled={createMutation.isLoading}
                placeholder="Enter a unique namespace name"
                name="name"
                type="text"
                variant="bc-input"
              />
            </FormControl>
          </form>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              isLoading={createMutation.isLoading}
              variant="primary"
              onClick={handleCreateNamespace}
            >
              Create
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NewNamespace;

const mutation = gql`
  mutation CreateNamespace($name: String!) {
    createNamespace(namespace: $name) {
      id
      name
    }
  }
`;
