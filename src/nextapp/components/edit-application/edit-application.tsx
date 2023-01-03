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

interface EditApplicationProps {
  data?: Application;
  open: boolean;
  onClose: () => void;
  refreshQueryKey: string;
}

const EditApplication: React.FC<EditApplicationProps> = ({
  data,
  open,
  onClose,
  refreshQueryKey,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const applicationMutation = useApiMutation(mutation);
  const form = React.useRef<HTMLFormElement>();
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createApplication();
  };
  const createApplication = async () => {
    if (form.current) {
      try {
        const formData = new FormData(form.current);

        if (form.current.checkValidity()) {
          const name = formData.get('name') as string;
          const description = formData.get('description') as string;
          await applicationMutation.mutateAsync({
            id: data?.id,
            data: { name, description },
          });
          toast({
            title: `${name} updated`,
            status: 'success',
            isClosable: true,
          });
          queryClient.invalidateQueries(refreshQueryKey);
          onClose();
        }
      } catch (err) {
        toast({
          title: 'Application update failed',
          description: err,
          status: 'error',
          isClosable: true,
        });
      }
    }
  };
  const submitForm = React.useCallback(() => form.current?.requestSubmit(), []);

  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="4px">
        <ModalHeader>Edit Application</ModalHeader>
        <ModalBody>
          <form ref={form} onSubmit={onSubmit}>
            <FormControl isRequired mb={8}>
              <FormLabel>Application Name</FormLabel>
              <Input
                defaultValue={data?.name}
                name="name"
                variant="bc-input"
                data-testid="edit-app-name-input"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Description (Optional)</FormLabel>
              <FormHelperText>What does your application do?</FormHelperText>
              <Textarea
                defaultValue={data?.description}
                name="description"
                variant="bc-input"
                data-testid="edit-app-description-input"
              />
            </FormControl>
          </form>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button
              onClick={onClose}
              variant="secondary"
              data-testid="edit-app-cancel-btn"
            >
              Cancel
            </Button>
            <Button onClick={submitForm} data-testid="edit-app-submit-btn">
              Update
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditApplication;

const mutation = gql`
  mutation UpdateApplication($id: String, $data: ApplicationUpdateInput) {
    updateApplication(id: $id, data: $data) {
      id
    }
  }
`;
