import * as React from 'react';
import {
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
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
import { useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';
import { gql } from 'graphql-request';
import { Application, Mutation } from '@/shared/types/query.types';

interface NewApplicationDialog {
  open: boolean;
  onClose: () => void;
  userId: string;
  refreshQueryKey: string;
  handleAfterCreate?: (app: Application) => void;
}

const NewApplicationDialog: React.FC<NewApplicationDialog> = ({
  open,
  onClose,
  userId,
  refreshQueryKey,
  handleAfterCreate,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const applicationMutation = useApiMutation<{
    name: string;
    description: string;
    owner: string;
  }>(mutation);
  const form = React.useRef<HTMLFormElement>();
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createApplication();
  };
  const createApplication = async () => {
    if (form.current) {
      try {
        const data = new FormData(form.current);

        if (form.current.checkValidity()) {
          const name = data.get('name') as string;
          const description = data.get('description') as string;
          const newApplication: Mutation = await applicationMutation.mutateAsync(
            {
              name,
              description,
              owner: userId,
            }
          );
          toast({
            title: `${name} created!`,
            description: 'You can now request access to an API',
            status: 'success',
          });
          queryClient.invalidateQueries(refreshQueryKey);
          onClose();
          if (handleAfterCreate) {
            handleAfterCreate(newApplication?.createApplication);
          }
        }
      } catch {
        toast({
          title: 'Create Application Failed',
          status: 'error',
        });
      }
    }
  };
  const submitForm = React.useCallback(() => form.current?.requestSubmit(), []);

  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="4px">
        <ModalHeader>Create Application</ModalHeader>
        <ModalBody>
          <form ref={form} onSubmit={onSubmit}>
            <FormControl isRequired mb={8}>
              <FormLabel>Application Name</FormLabel>
<<<<<<< HEAD
              <Input
                placeholder=" Name"
                name="name"
                variant="bc-input"
                data-testid="create-app-name-input"
              />
            </FormControl>
            <FormControl isRequired as="fieldset">
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                placeholder="What does your application do?"
                variant="bc-input"
                data-testid="create-app-description-input"
              />
=======
              <Input name="name" variant="bc-input" />
            </FormControl>
            <FormControl>
              <FormLabel>Description (Optional)</FormLabel>
              <FormHelperText>What does your application do?</FormHelperText>
              <Textarea name="description" variant="bc-input" />
>>>>>>> dev
            </FormControl>
          </form>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button
              onClick={onClose}
              variant="secondary"
              data-testid="create-app-cancel-btn"
            >
              Cancel
            </Button>
            <Button onClick={submitForm} data-testid="create-app-submit-btn">
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
  mutation Add($name: String!, $description: String) {
    createApplication(data: { name: $name, description: $description }) {
      id
      appId
      name
    }
  }
`;
