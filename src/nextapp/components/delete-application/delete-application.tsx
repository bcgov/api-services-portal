import { useApiMutation } from '@/shared/services/api';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Icon,
  IconButton,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import * as React from 'react';
import { FaTrash } from 'react-icons/fa';
import { useQueryClient } from 'react-query';

interface DeleteApplicationProps {
  id: string;
}

const DeleteApplication: React.FC<DeleteApplicationProps> = ({ id }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const deleteMutation = useApiMutation<{ id: string }>(mutation);
  const cancelRef = React.useRef();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries('allApplications');
      toast({
        title: 'Application deleted',
        status: 'success',
      });
      onClose();
    } catch {
      toast({
        title: 'Application delete failed',
        status: 'error',
      });
    }
  };

  return (
    <>
      <IconButton
        aria-label="delete application button"
        colorScheme="red"
        icon={<Icon as={FaTrash} />}
        onClick={onOpen}
        variant="outline"
        size="sm"
        data-testid="app-delete-icon"
      />
      <AlertDialog
        isCentered
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Delete Application</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to delete this application? It cannot be
            undone.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={onClose}
              data-testid="app-delete-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              onClick={handleDelete}
              data-testid="app-delete-submit-btn"
            >
              Yes, Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteApplication;

const mutation = gql`
  mutation Remove($id: ID!) {
    deleteApplication(id: $id) {
      name
      id
    }
  }
`;
