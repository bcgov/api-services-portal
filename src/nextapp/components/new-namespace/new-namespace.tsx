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
import type { Mutation } from '@/types/query.types';
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
          const json: Mutation = await createMutation.mutateAsync({
            name,
          });

          toast({
            title: `Namespace ${json.createNamespace.name} created!`,
            status: 'success',
          });
          await restApi(`/admin/switch/${json.createNamespace.id}`, {
            method: 'PUT',
          });
          queryClient.invalidateQueries();
          toast({
            title: `Switched to  ${json.createNamespace.name} namespace`,
            status: 'success',
          });
          onClose();
        } catch (err) {
          toast({
            title: 'Namespace Create Failed',
            description: err,
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
                data-testid="ns-modal-name-input"
              />
            </FormControl>
          </form>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button
              onClick={onClose}
              data-testid="ns-modal-cancel-btn"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              isLoading={createMutation.isLoading}
              variant="primary"
              onClick={handleCreateNamespace}
              data-testid="ns-modal-create-btn"
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
