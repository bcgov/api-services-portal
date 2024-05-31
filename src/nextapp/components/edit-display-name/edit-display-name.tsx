import * as React from 'react';
import {
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  FormLabel,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FaPen } from 'react-icons/fa';
import { QueryKey, useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';
import { gql } from 'graphql-request';
import { NamespaceInput } from '@/shared/types/query.types';

interface EditNamespaceDisplayNameProps {
  data: NamespaceInput;
  queryKey: QueryKey;
}

const EditNamespaceDisplayName: React.FC<EditNamespaceDisplayNameProps> = ({
  data,
  queryKey,
}) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();
  const mutate = useApiMutation<NamespaceInput>(mutation);
  const form = React.useRef<HTMLFormElement>();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateNamespaceDisplayName();
  };
  const updateNamespaceDisplayName = async () => {
    if (form.current) {
      try {
        const formData = new FormData(form.current);

        if (form.current.checkValidity()) {
          const name = formData.get('name') as string;
          const displayName = formData.get('displayName') as string;
          await mutate.mutateAsync({
            // id: data?.id,
            data: { name, displayName },
          });
          toast({
            title: 'Display name successfully edited',
            status: 'success',
            isClosable: true,
          });
          queryClient.invalidateQueries(queryKey);
          onClose();
        }
      } catch (err) {
        toast({
          title: 'Display name update failed',
          description: err,
          status: 'error',
          isClosable: true,
        });
      }
    }
  };
  const handleSaveClick = () => {
    form.current?.requestSubmit();
  };
  return (
    <>
      <Button
        leftIcon={<Icon as={FaPen} />}
        variant="ghost"
        size="sm"
        onClick={onOpen}
        data-testid="display-name-edit-btn"
      >
        Edit
      </Button>
      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent borderRadius="4px">
          <ModalHeader>Edit display name</ModalHeader>
          <ModalBody>
            <form ref={form} onSubmit={handleSubmit}>
              <FormControl isRequired>
                <FormLabel></FormLabel>
                <FormHelperText>
                  A meaningful display name makes it easy for anyone to identify and distinguish this gateway from others.
                </FormHelperText>
                <Input
                  // defaultValue={data?.displayName}
                  defaultValue={data?.name}
                  name="displayName"
                  variant="bc-input"
                  data-testid="edit-display-name-input"
                />
              </FormControl>
            </form>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button
                onClick={onClose}
                variant="secondary"
                data-testid="edit-display-name-cancel-btn"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveClick} data-testid="edit-display-name-submit-btn">
                Update
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditNamespaceDisplayName;

const mutation = gql`
  mutation UpdateNamespaceDisplayName($id: ID!, $data: NamespaceInput) {
    updateNamespace(id: $id, data: $data) {
      id
    }
  }
`;
