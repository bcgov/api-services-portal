import * as React from 'react';
import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  UnorderedList,
  useToast,
} from '@chakra-ui/react';
import { useQueryClient } from 'react-query';
import { gql } from 'graphql-request';
import { restApi, useApiMutation } from '@/shared/services/api';
import type { Mutation } from '@/types/query.types';
interface NewNamespace {
  isOpen: boolean;
  onClose: () => void;
}

const NewNamespace: React.FC<NewNamespace> = ({ isOpen, onClose }) => {
  const [error, setError] = React.useState<string | null>(null);
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
            isClosable: true,
          });
          await restApi(`/admin/switch/${json.createNamespace.id}`, {
            method: 'PUT',
          });
          queryClient.invalidateQueries();
          toast({
            title: `Switched to ${json.createNamespace.name} namespace`,
            status: 'success',
            isClosable: true,
          });
          onClose();
        } catch (err) {
          setError(err);
          // toast({
          //   title: 'Namespace create failed',
          //   description: err,
          //   status: 'error',
          //   isClosable: true,
          // });
        }
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="4px">
        <ModalHeader>Create Namespace</ModalHeader>
        <ModalBody>
          <form ref={form} onSubmit={onSubmit}>
            <FormControl isRequired mb={4} isInvalid={Boolean(error)}>
              <FormLabel>Namespace Name</FormLabel>
              <Input
                isDisabled={createMutation.isLoading}
                name="name"
                type="text"
                variant="bc-input"
                data-testid="ns-modal-name-input"
              />
              {error && <FormErrorMessage>{error}</FormErrorMessage>}
              <FormHelperText fontSize="14px" color="text" lineHeight="6">
                Names must be:
                <UnorderedList>
                  <ListItem>
                    Alphanumeric (letters and numbers only, no special
                    characters)
                  </ListItem>
                  <ListItem>Unique to all other namespaces</ListItem>
                </UnorderedList>
              </FormHelperText>
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
              Create Namespace
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
