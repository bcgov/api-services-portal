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
import { restApi } from '@/shared/services/api';

interface NewNamespace {
  isOpen: boolean;
  onClose: () => void;
}

const NewNamespace: React.FC<NewNamespace> = ({ isOpen, onClose }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    async (payload: { name: string }) =>
      await restApi<{ name: string; id: string }>('/gw/api/namespaces', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
  );
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
          const json = await mutation.mutateAsync({
            name,
          });

          toast({
            title: `Namespace ${json.name} created!`,
            status: 'success',
          });
          queryClient.invalidateQueries();
          toast({
            title: `Switched to  ${json.name} namespace`,
            status: 'success',
          });
          onClose();
        } catch (err) {
          toast({
            title: 'Namespace Create Failed',
            description: err?.message,
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
                isDisabled={mutation.isLoading}
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
              isLoading={mutation.isLoading}
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
